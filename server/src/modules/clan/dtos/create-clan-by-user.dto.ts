import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClanByUserDto {
  @ApiProperty({ example: 'Elite Warriors' })
  @IsString()
  name: string;
}
