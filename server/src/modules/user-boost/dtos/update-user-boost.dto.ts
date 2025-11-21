import { IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserBoostDto {
  @ApiProperty({
    example: '2024-01-01T12:00:00.000Z',
    required: false,
    description: 'Время окончания буста',
  })
  @IsOptional()
  @IsDateString()
  end_time?: Date;
}
