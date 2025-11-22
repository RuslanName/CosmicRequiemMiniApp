import { ApiProperty } from '@nestjs/swagger';
import { Admin } from '../../../admin/admin.entity';

export class AdminAuthValidateResponseDto {
  @ApiProperty()
  token: string;

  @ApiProperty({ type: () => Admin })
  admin: Admin;
}
