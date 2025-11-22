import { ApiProperty } from '@nestjs/swagger';

export class AttackPlayerResponseDto {
  @ApiProperty()
  win_chance: number;

  @ApiProperty()
  is_win: boolean;

  @ApiProperty()
  stolen_money: number;

  @ApiProperty()
  captured_guards: number;

  @ApiProperty()
  attack_cooldown_end: Date;
}
