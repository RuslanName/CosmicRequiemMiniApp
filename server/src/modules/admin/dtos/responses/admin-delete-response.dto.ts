import { ApiProperty } from '@nestjs/swagger';

export class AdminDeleteResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;
}
