import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventHistory } from './event-history.entity';
import { EventHistoryService } from './event-history.service';

@Module({
  imports: [TypeOrmModule.forFeature([EventHistory])],
  providers: [EventHistoryService],
  exports: [EventHistoryService, TypeOrmModule],
})
export class EventHistoryModule {}
