import { ApiProperty } from '@nestjs/swagger';

export class AdminLoginResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;
}
