import { IsEnum, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserBoostType } from '../enums/user-boost-type.enum';

export class CreateUserBoostDto {
  @ApiProperty({
    example: 'cooldown_halving',
    enum: UserBoostType,
    description: 'Тип буста',
  })
  @IsEnum(UserBoostType)
  type: UserBoostType;

  @ApiProperty({ example: 1, description: 'ID пользователя' })
  @IsNumber()
  user_id: number;
}
