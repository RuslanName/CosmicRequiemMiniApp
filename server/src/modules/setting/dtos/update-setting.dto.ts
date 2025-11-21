import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingDto {
  @ApiProperty({
    example: 'TRAINING_COOLDOWN',
    required: false,
    description: 'Ключ настройки',
  })
  @IsOptional()
  @IsString()
  key?: string;

  @ApiProperty({
    example: '900000',
    required: false,
    description: 'Значение настройки',
  })
  @IsOptional()
  @IsString()
  value?: string;
}
