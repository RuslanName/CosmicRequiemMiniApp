import { ApiProperty } from '@nestjs/swagger';
import { UserMeResponseDto } from './user-me-response.dto';

export class ContractResponseDto {
  @ApiProperty({ type: () => UserMeResponseDto })
  user: UserMeResponseDto;

  @ApiProperty()
  contract_income: number;

  @ApiProperty()
  contract_cooldown_end: Date;
}
