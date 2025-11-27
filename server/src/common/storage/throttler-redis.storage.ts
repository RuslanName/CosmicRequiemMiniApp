import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { ThrottlerStorage } from '@nestjs/throttler';

interface ThrottlerStorageRecord {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
}

@Injectable()
export class ThrottlerRedisStorage implements ThrottlerStorage {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const data = await this.redis.get(`throttler:${key}`);
    const records: number[] = data ? JSON.parse(data) : [];
    const now = Date.now();
    const validRecords = records.filter((timestamp) => timestamp > now);
    validRecords.push(now + ttl);
    const ttlSeconds = Math.ceil(ttl / 1000);
    await this.redis.setex(
      `throttler:${key}`,
      ttlSeconds,
      JSON.stringify(validRecords),
    );

    const totalHits = validRecords.length;
    const isBlocked = totalHits >= limit;
    const timeToExpire = isBlocked
      ? Math.max(...validRecords) - now
      : ttlSeconds * 1000;
    const timeToBlockExpire = isBlocked ? blockDuration * 1000 : 0;

    return {
      totalHits,
      timeToExpire,
      isBlocked,
      timeToBlockExpire,
    };
  }
}
