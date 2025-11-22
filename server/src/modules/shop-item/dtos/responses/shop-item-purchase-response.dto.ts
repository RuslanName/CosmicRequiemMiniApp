import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../user/user.entity';
import { UserGuard } from '../../../user-guard/user-guard.entity';
import { UserAccessory } from '../../../user-accessory/user-accessory.entity';
import { UserBoost } from '../../../user-boost/user-boost.entity';

export class ShopItemPurchaseResponseDto {
  @ApiProperty({ type: () => User })
  user: User;

  @ApiProperty({ type: () => UserGuard, required: false })
  created_guard?: UserGuard;

  @ApiProperty({ type: () => UserAccessory, required: false })
  user_accessory?: UserAccessory;

  @ApiProperty({ type: () => UserBoost, required: false })
  user_boost?: UserBoost;

  @ApiProperty({ required: false })
  shield_cooldown_end?: Date;
}
