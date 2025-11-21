import { IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  @ApiProperty({
    example: {
      id: 123456789,
      first_name: 'John',
      last_name: 'Doe',
      sex: 2,
      photo_max_orig: 'https://example.com/photo.jpg',
    },
    description: 'Данные пользователя из VK',
  })
  @IsObject()
  user: {
    id: number;
    first_name: string;
    last_name?: string;
    photo_200?: string;
    photo_max_orig?: string;
    bdate?: string;
    bdate_visibility?: number;
    sex?: number;
  };

  @ApiProperty({
    example: 'vk_signature_hash',
    description: 'Подпись VK для проверки',
  })
  @IsString()
  sign: string;

  @ApiProperty({
    example: {
      vk_user_id: '123456789',
      vk_app_id: '12345',
    },
    description: 'Параметры VK',
  })
  @IsObject()
  vk_params: Record<string, string>;
}
