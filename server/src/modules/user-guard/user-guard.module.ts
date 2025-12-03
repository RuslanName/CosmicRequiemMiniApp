import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserGuardController } from './user-guard.controller';
import { UserGuardService } from './user-guard.service';
import { UserGuard } from './user-guard.entity';
import { User } from '../user/user.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserGuard, User]),
    forwardRef(() => UserModule),
  ],
  controllers: [UserGuardController],
  providers: [UserGuardService],
  exports: [UserGuardService],
})
export class UserGuardModule {}
