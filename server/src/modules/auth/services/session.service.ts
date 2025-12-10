import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In } from 'typeorm';
import { Session } from '../entities/session.entity';
import { randomBytes } from 'crypto';
import { Cron } from '@nestjs/schedule';
import { CacheService } from '../../../common/services/cache.service';

@Injectable()
export class SessionService {
  private readonly SESSION_CACHE_PREFIX = 'session:';
  private readonly SESSION_CACHE_TTL_BUFFER = 60;

  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    private readonly cacheService: CacheService,
  ) {}

  async createSession(
    userId: number,
    expiresInSeconds: number,
  ): Promise<string> {
    const sessionId = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresInSeconds);

    const session = this.sessionRepository.create({
      session_id: sessionId,
      user_id: userId,
      expires_at: expiresAt,
      last_used_at: new Date(),
    });

    await this.sessionRepository.save(session);

    const cacheKey = `${this.SESSION_CACHE_PREFIX}${sessionId}`;
    await this.cacheService.set(
      cacheKey,
      { userId, expiresAt: expiresAt.toISOString() },
      expiresInSeconds + this.SESSION_CACHE_TTL_BUFFER,
    );

    return sessionId;
  }

  async validateSession(
    sessionId: string,
    expiresInSeconds?: number,
  ): Promise<{ userId: number; shouldExtend: boolean } | null> {
    const cacheKey = `${this.SESSION_CACHE_PREFIX}${sessionId}`;

    const cached = await this.cacheService.get<{
      userId: number;
      expiresAt: string;
    }>(cacheKey);

    if (cached) {
      const expiresAt = new Date(cached.expiresAt);
      const now = new Date();

      if (expiresAt < now) {
        await this.cacheService.del(cacheKey);
        const session = await this.sessionRepository.findOne({
          where: { session_id: sessionId },
        });
        if (!session || session.expires_at < now) {
          return null;
        }

        session.last_used_at = now;
        let shouldExtend = false;
        let newExpiresAt = session.expires_at;
        if (expiresInSeconds) {
          newExpiresAt = new Date();
          newExpiresAt.setSeconds(newExpiresAt.getSeconds() + expiresInSeconds);
          session.expires_at = newExpiresAt;
          shouldExtend = true;
        }
        await this.sessionRepository.save(session);

        const remainingSeconds = Math.floor(
          (newExpiresAt.getTime() - now.getTime()) / 1000,
        );
        const cacheTtl =
          remainingSeconds > 0
            ? remainingSeconds + this.SESSION_CACHE_TTL_BUFFER
            : this.SESSION_CACHE_TTL_BUFFER;

        await this.cacheService.set(
          cacheKey,
          {
            userId: session.user_id,
            expiresAt: newExpiresAt.toISOString(),
          },
          cacheTtl,
        );

        return { userId: session.user_id, shouldExtend };
      } else {
        let shouldExtend = false;
        if (expiresInSeconds) {
          const newExpiresAt = new Date();
          newExpiresAt.setSeconds(newExpiresAt.getSeconds() + expiresInSeconds);

          const session = await this.sessionRepository.findOne({
            where: { session_id: sessionId },
          });

          if (!session || session.expires_at < now) {
            await this.cacheService.del(cacheKey);
            return null;
          }

          session.expires_at = newExpiresAt;
          session.last_used_at = now;
          await this.sessionRepository.save(session);

          await this.cacheService.set(
            cacheKey,
            {
              userId: cached.userId,
              expiresAt: newExpiresAt.toISOString(),
            },
            expiresInSeconds + this.SESSION_CACHE_TTL_BUFFER,
          );

          shouldExtend = true;
        }

        return { userId: cached.userId, shouldExtend };
      }
    }

    const session = await this.sessionRepository.findOne({
      where: { session_id: sessionId },
    });

    if (!session) {
      return null;
    }

    const now = new Date();
    if (session.expires_at < now) {
      await this.sessionRepository.remove(session);
      return null;
    }

    session.last_used_at = now;

    let shouldExtend = false;
    let newExpiresAt = session.expires_at;
    if (expiresInSeconds) {
      newExpiresAt = new Date();
      newExpiresAt.setSeconds(newExpiresAt.getSeconds() + expiresInSeconds);
      session.expires_at = newExpiresAt;
      shouldExtend = true;
    }

    await this.sessionRepository.save(session);

    const remainingSeconds = Math.floor(
      (newExpiresAt.getTime() - now.getTime()) / 1000,
    );
    const cacheTtl =
      remainingSeconds > 0
        ? remainingSeconds + this.SESSION_CACHE_TTL_BUFFER
        : this.SESSION_CACHE_TTL_BUFFER;

    await this.cacheService.set(
      cacheKey,
      {
        userId: session.user_id,
        expiresAt: newExpiresAt.toISOString(),
      },
      cacheTtl,
    );

    return { userId: session.user_id, shouldExtend };
  }

  private async updateSessionInDb(
    sessionId: string,
    expiresAt: Date,
    expiresInSeconds: number,
  ): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { session_id: sessionId },
    });

    if (session) {
      session.expires_at = expiresAt;
      session.last_used_at = new Date();
      await this.sessionRepository.save(session);
    }
  }

  async revokeSession(sessionId: string): Promise<void> {
    const cacheKey = `${this.SESSION_CACHE_PREFIX}${sessionId}`;
    await Promise.all([
      this.sessionRepository.delete({ session_id: sessionId }),
      this.cacheService.del(cacheKey),
    ]);
  }

  async revokeAllUserSessions(userId: number): Promise<void> {
    const sessions = await this.sessionRepository.find({
      where: { user_id: userId },
      select: ['session_id'],
    });

    const cacheKeys = sessions.map(
      (s) => `${this.SESSION_CACHE_PREFIX}${s.session_id}`,
    );

    await Promise.all([
      this.sessionRepository.delete({ user_id: userId }),
      ...cacheKeys.map((key) => this.cacheService.del(key)),
    ]);
  }

  @Cron('*/15 * * * *')
  async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    const batchSize = 100;

    let deleted = 0;
    do {
      const expiredSessions = await this.sessionRepository.find({
        where: { expires_at: LessThan(now) },
        take: batchSize,
        select: ['session_id'],
      });

      if (expiredSessions.length === 0) {
        break;
      }

      const sessionIds = expiredSessions.map((s) => s.session_id);
      const cacheKeys = sessionIds.map(
        (id) => `${this.SESSION_CACHE_PREFIX}${id}`,
      );

      await Promise.all([
        this.sessionRepository.delete({ session_id: In(sessionIds) }),
        ...cacheKeys.map((key) => this.cacheService.del(key)),
      ]);

      deleted = expiredSessions.length;
    } while (deleted === batchSize);
  }
}
