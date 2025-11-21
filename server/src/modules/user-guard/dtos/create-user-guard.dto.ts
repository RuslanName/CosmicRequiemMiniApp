import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserGuardDto {
  @ApiProperty({ example: 'Страж Альфа', description: 'Имя стража' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 100,
    description: 'Сила стража',
    required: false,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  strength?: number;

  @ApiProperty({
    example: false,
    description: 'Является ли страж первым (нельзя захватить)',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  is_first?: boolean;

  @ApiProperty({ example: 1, description: 'ID пользователя-владельца' })
  @IsNumber()
  user_id: number;
}
