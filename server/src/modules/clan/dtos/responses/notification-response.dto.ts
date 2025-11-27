import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../../../notification/enums/notification-type.enum';
import { NotificationStatus } from '../../../notification/enums/notification-status.enum';

export class NotificationResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: NotificationType })
  type: NotificationType;

  @ApiProperty({ enum: NotificationStatus })
  status: NotificationStatus;

  @ApiProperty()
  created_at: Date;
}
