import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { postgresConfig } from '../config/postgres.config';
import { redisConfig } from '../config/redis.config';
import { UserModule } from './user/user.module';
import { UserGuardModule } from './user-guard/user-guard.module';
import { ClanModule } from './clan/clan.module';
import { SettingModule } from './setting/setting.module';
import { ClanWarModule } from './clan-war/clan-war.module';
import { ShopItemModule } from './shop-item/shop-item.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from '../common/common.module';
import { KitModule } from './kit/kit.module';
import { ItemTemplateModule } from './item-template/item-template.module';
import { AdminModule } from './admin/admin.module';
import { UserBoostModule } from './user-boost/user-boost.module';
import { VKPaymentsModule } from './vk-payments/vk-payments.module';
import { TaskModule } from './task/task.module';
import { GiveawayModule } from './giveaway/giveaway.module';
import { NotificationModule } from './notification/notification.module';
import { AppController } from './app.controller';
import { ThrottlerRedisStorage } from '../common/storage/throttler-redis.storage';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '..env',
    }),

    ScheduleModule.forRoot(),

    TypeOrmModule.forRoot(postgresConfig),

    RedisModule.forRoot({
      type: 'single',
      url: redisConfig.password
        ? `redis://:${redisConfig.password}@${redisConfig.host}:${redisConfig.port}`
        : `redis://${redisConfig.host}:${redisConfig.port}`,
      options: {
        password: redisConfig.password || undefined,
      },
    }),

    CommonModule,

    ThrottlerModule.forRootAsync({
      imports: [CommonModule],
      useFactory: (storage: ThrottlerRedisStorage) => ({
        throttlers: [
          {
            ttl: 60000,
            limit: 30,
          },
        ],
        storage,
      }),
      inject: [ThrottlerRedisStorage],
    }),
    ShopItemModule,
    AuthModule,
    AdminModule,
    ClanModule,
    ClanWarModule,
    KitModule,
    ItemTemplateModule,
    SettingModule,
    UserModule,
    UserGuardModule,
    UserBoostModule,
    VKPaymentsModule,
    TaskModule,
    GiveawayModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
