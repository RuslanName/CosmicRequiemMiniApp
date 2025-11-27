import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClanByUserDto {
  @ApiProperty({ example: 'Elite Warriors' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 123456789,
    required: false,
    description: 'ID сообщества VK',
  })
  @IsOptional()
  @IsNumber()
  vk_group_id?: number;
}
