import { ApiProperty } from '@nestjs/swagger';
import { EventHistoryType } from '../../../event-history/enums/event-history-type.enum';
import { UserAccessoryResponseDto } from '../../../user-accessory/dtos/user-accessory-response.dto';
import { UserWithBasicStatsResponseDto } from './user-with-basic-stats-response.dto';

export class EventHistoryItemResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ enum: EventHistoryType })
  type: EventHistoryType;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  stolen_money: number;

  @ApiProperty()
  stolen_strength: number;

  @ApiProperty()
  stolen_guards_count: number;

  @ApiProperty({
    type: () => UserWithBasicStatsResponseDto,
    required: false,
    nullable: true,
  })
  opponent?: UserWithBasicStatsResponseDto | null;

  @ApiProperty({
    type: [UserAccessoryResponseDto],
    required: false,
    nullable: true,
  })
  opponent_equipped_accessories?: UserAccessoryResponseDto[] | null;
}
