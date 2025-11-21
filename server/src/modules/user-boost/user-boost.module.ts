import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserBoostService } from './user-boost.service';
import { UserBoost } from './user-boost.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserBoost])],
  providers: [UserBoostService],
  exports: [UserBoostService, TypeOrmModule],
})
export class UserBoostModule {}
