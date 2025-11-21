import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AttackPlayerDto {
  @ApiProperty({
    example: 5,
    description: 'ID целевого пользователя для атаки',
  })
  @IsNumber()
  target_user_id: number;
}
