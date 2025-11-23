import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class ActivateShieldDto {
  @ApiProperty({ example: 1, description: 'ID аксессуара-щита' })
  @IsNumber()
  accessory_id: number;
}
