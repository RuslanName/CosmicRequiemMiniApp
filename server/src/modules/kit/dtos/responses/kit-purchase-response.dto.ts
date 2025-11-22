import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../user/user.entity';
import { UserGuard } from '../../../user-guard/user-guard.entity';
import { UserAccessory } from '../../../user-accessory/user-accessory.entity';
import { UserBoost } from '../../../user-boost/user-boost.entity';

export class KitPurchaseResponseDto {
  @ApiProperty({ type: () => User })
  user: User;

  @ApiProperty({ type: [UserGuard] })
  created_guards: UserGuard[];

  @ApiProperty({ type: [UserAccessory] })
  user_accessories: UserAccessory[];

  @ApiProperty({ type: [UserBoost] })
  user_boosts: UserBoost[];
}
