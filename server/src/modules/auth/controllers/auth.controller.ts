import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { AuthDto } from '../dtos/auth.dto';
import { AuthLoginResponseDto } from '../dtos/responses/auth-login-response.dto';

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
    type: AuthLoginResponseDto,
  })
  @ApiResponse({
    status: 401,
  })
  async login(@Body() authDto: AuthDto): Promise<AuthLoginResponseDto> {
    const token = await this.authService.validateAuth(authDto);
    return { token };
  }
}
