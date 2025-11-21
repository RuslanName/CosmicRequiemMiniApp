import { IsOptional, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ClanWarStatus } from '../enums/clan-war-status.enum';

export class UpdateClanWarDto {
  @ApiProperty({ example: 1, required: false, description: 'ID первого клана' })
  @IsOptional()
  @IsNumber()
  clan_1_id?: number;

  @ApiProperty({ example: 2, required: false, description: 'ID второго клана' })
  @IsOptional()
  @IsNumber()
  clan_2_id?: number;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    required: false,
    description: 'Время начала войны',
  })
  @IsOptional()
  @IsDateString()
  start_time?: Date;

  @ApiProperty({
    example: '2024-01-01T06:00:00.000Z',
    required: false,
    description: 'Время окончания войны',
  })
  @IsOptional()
  @IsDateString()
  end_time?: Date;

  @ApiProperty({
    example: 'completed',
    enum: ClanWarStatus,
    required: false,
    description: 'Статус войны',
  })
  @IsOptional()
  @IsEnum(ClanWarStatus)
  status?: ClanWarStatus;
}
