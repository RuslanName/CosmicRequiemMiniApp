import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { AuthDto } from '../dtos/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiOperation({
    summary:
      'Аутентификация пользователя и получение JWT токена (Для Mini App)',
  })
  @ApiBody({ type: AuthDto })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 401,
    schema: {
      example: {
        message: 'Invalid VK signature',
      },
    },
  })
  async login(@Body() authDto: AuthDto): Promise<{ token: string }> {
    const token = await this.authService.validateAuth(authDto);
    return { token };
  }
}
