import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Session } from '../entities/session.entity';
import { randomBytes } from 'crypto';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async createSession(
    userId: number,
    expiresInSeconds: number = 30 * 24 * 60 * 60,
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
    return sessionId;
  }

  async validateSession(sessionId: string): Promise<{ userId: number } | null> {
    const session = await this.sessionRepository.findOne({
      where: { session_id: sessionId },
      relations: ['user'],
    });

    if (!session) {
      return null;
    }

    if (session.expires_at < new Date()) {
      await this.sessionRepository.remove(session);
      return null;
    }

    session.last_used_at = new Date();
    await this.sessionRepository.save(session);

    return { userId: session.user_id };
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.sessionRepository.delete({ session_id: sessionId });
  }

  async revokeAllUserSessions(userId: number): Promise<void> {
    await this.sessionRepository.delete({ user_id: userId });
  }

  @Cron('0 0 * * * *')
  async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    await this.sessionRepository.delete({
      expires_at: LessThan(now),
    });
  }
}
