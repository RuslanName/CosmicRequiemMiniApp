import { IsNumber, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ClanWarStatus } from '../enums/clan-war-status.enum';

export class CreateClanWarDto {
  @ApiProperty({ example: 1, description: 'ID первого клана' })
  @IsNumber()
  clan_1_id: number;

  @ApiProperty({ example: 2, description: 'ID второго клана' })
  @IsNumber()
  clan_2_id: number;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Время начала войны',
  })
  @IsDateString()
  start_time: Date;

  @ApiProperty({
    example: '2024-01-01T06:00:00.000Z',
    description: 'Время окончания войны',
  })
  @IsDateString()
  end_time: Date;

  @ApiProperty({
    example: 'in_progress',
    enum: ClanWarStatus,
    required: false,
    description: 'Статус войны',
  })
  @IsOptional()
  @IsEnum(ClanWarStatus)
  status?: ClanWarStatus;
}
