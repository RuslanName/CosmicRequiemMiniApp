import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token для обновления access token' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
