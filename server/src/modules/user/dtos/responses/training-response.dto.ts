import { ApiProperty } from '@nestjs/swagger';
import { UserMeResponseDto } from './user-me-response.dto';

export class TrainingResponseDto {
  @ApiProperty({ type: () => UserMeResponseDto })
  user: UserMeResponseDto;

  @ApiProperty()
  training_cost: number;

  @ApiProperty()
  power_increase: number;

  @ApiProperty()
  new_power: number;

  @ApiProperty()
  training_cooldown_end: Date;
}
