import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserGuardDto {
  @ApiProperty({
    example: 'Страж Альфа',
    description: 'Имя стража',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 150, description: 'Сила стража', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  strength?: number;

  @ApiProperty({
    example: false,
    description: 'Является ли страж первым (нельзя захватить)',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_first?: boolean;

  @ApiProperty({
    example: 1,
    description: 'ID пользователя-владельца',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  user_id?: number;
}
