import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClanWarController } from './clan-war.controller';
import { ClanWarService } from './services/clan-war.service';
import { ClanWarSchedulerService } from './services/clan-war-scheduler.service';
import { ClanWar } from './entities/clan-war.entity';
import { StolenItem } from './entities/stolen-item.entity';
import { User } from '../user/user.entity';
import { UserGuard } from '../user-guard/user-guard.entity';
import { Clan } from '../clan/entities/clan.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClanWar, StolenItem, User, UserGuard, Clan]),
    NotificationModule,
  ],
  controllers: [ClanWarController],
  providers: [ClanWarService, ClanWarSchedulerService],
  exports: [ClanWarService],
})
export class ClanWarModule {}
