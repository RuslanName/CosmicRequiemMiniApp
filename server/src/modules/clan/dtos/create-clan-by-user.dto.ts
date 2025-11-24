import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClanByUserDto {
  @ApiProperty({ example: 'Elite Warriors' })
  @IsString()
  name: string;

  @ApiProperty({ example: 50, required: false })
  @IsOptional()
  @IsNumber()
  max_members?: number;
}
