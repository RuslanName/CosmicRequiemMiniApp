import { Controller, Post, Body, Res, Req, Headers } from '@nestjs/common';
import { Request as ExpressRequest, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { AuthDto } from '../dtos/auth.dto';
import { AuthLoginResponseDto } from '../dtos/responses/auth-login-response.dto';
import { LogoutResponseDto } from '../dtos/responses/logout-response.dto';
import { ENV } from '../../../config/constants';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 30 * 24 * 60 * 60;
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 30 * 24 * 60 * 60;
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Аутентификация пользователя и получение сессии (Для Mini App)',
  })
  @ApiBody({ type: AuthDto })
  @ApiResponse({
    status: 200,
    type: AuthLoginResponseDto,
  })
  @ApiResponse({
    status: 401,
  })
  async login(
    @Body() authDto: AuthDto,
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
    @Headers('start-param') startParam?: string,
  ): Promise<AuthLoginResponseDto> {
    const headerStartParam =
      startParam || (req.headers['start-param'] as string | undefined);
    const { sessionId } = await this.authService.validateAuth(
      authDto,
      headerStartParam,
    );

    const sessionExpiresInSeconds = this.parseExpiresIn(ENV.SESSION_EXPIRES_IN);
    res.cookie('session_id', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: sessionExpiresInSeconds * 1000,
      path: '/',
    });

    return {
      sessionId,
    };
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Выход из системы и отзыв сессии (Для Mini App)',
  })
  @ApiResponse({
    status: 200,
    type: LogoutResponseDto,
    description: 'Выход выполнен успешно',
  })
  async logout(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogoutResponseDto> {
    const sessionId =
      req.cookies?.session_id || (req.headers['x-session-id'] as string);

    if (sessionId) {
      await this.authService.revokeSession(sessionId);
    }

    res.clearCookie('session_id', {
      httpOnly: true,
      secure: ENV.MODE === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return {
      success: true,
      message: 'Выход выполнен успешно',
    };
  }
}
