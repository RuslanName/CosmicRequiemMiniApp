import { ApiProperty } from '@nestjs/swagger';

export class ClanReferralLinkResponseDto {
  @ApiProperty()
  referral_link: string;
}
