import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class GetFriendsDto {
  @ApiProperty({
    description: 'Список VK ID друзей',
    type: [Number],
    example: [123456, 789012],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Список друзей не может быть пустым' })
  @ArrayMaxSize(5000, { message: 'Максимум 5000 друзей за раз' })
  @IsNumber({}, { each: true, message: 'Каждый элемент должен быть числом' })
  friend_vk_ids: number[];
}
