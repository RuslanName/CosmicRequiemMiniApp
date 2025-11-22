import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user.entity';
import { UserBoost } from '../../../user-boost/user-boost.entity';

export class ActivateShieldResponseDto {
  @ApiProperty({ type: () => User })
  user: User;

  @ApiProperty({ type: () => UserBoost })
  user_boost: UserBoost;
}

