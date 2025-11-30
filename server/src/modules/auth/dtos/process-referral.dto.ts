import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProcessReferralDto {
  @ApiProperty({
    example: '6f448ac3-8d9d-415f-9c97-e3a0fd6291be',
    description: 'ID реферальной ссылки',
  })
  @IsString()
  referral_link_id: string;
}
