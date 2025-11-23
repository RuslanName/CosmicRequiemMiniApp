import { ApiProperty } from '@nestjs/swagger';
import { EventHistoryType } from '../../../event-history/enums/event-history-type.enum';

export class EventHistoryItemResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ enum: EventHistoryType })
  type: EventHistoryType;

  @ApiProperty()
  user_id: number;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  strength: number;

  @ApiProperty()
  money: number;

  @ApiProperty()
  guards_count: number;
}
