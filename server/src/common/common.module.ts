import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheInterceptor } from './interceptors/cache.interceptor';
import { CacheService } from './services/cache.service';
import { ThrottlerRedisStorage } from './storage/throttler-redis.storage';

@Global()
@Module({
  providers: [
    CacheService,
    ThrottlerRedisStorage,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
  exports: [CacheService, ThrottlerRedisStorage],
})
export class CommonModule {}
