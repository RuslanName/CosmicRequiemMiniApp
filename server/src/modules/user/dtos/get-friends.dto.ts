import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  ArrayMinSize,
  ArrayMaxSize,
  IsOptional,
  IsString,
} from 'class-validator';

export class GetFriendsDto {
  @ApiProperty({
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5000, { message: 'Максимум 5000 друзей за раз' })
  @IsNumber({}, { each: true, message: 'Каждый элемент должен быть числом' })
  friend_vk_ids?: number[];

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  vk_access_token?: string;
}
