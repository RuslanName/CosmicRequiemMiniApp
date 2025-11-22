import { ApiProperty } from '@nestjs/swagger';
import { UserBoost } from '../../../user-boost/user-boost.entity';
import { UserAccessory } from '../../../user-accessory/user-accessory.entity';

export class InventoryResponseDto {
  @ApiProperty({ type: [UserBoost] })
  boosts: UserBoost[];

  @ApiProperty({ type: [UserAccessory] })
  accessories: UserAccessory[];
}
