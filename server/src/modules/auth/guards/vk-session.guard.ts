import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionService } from '../services/session.service';

@Injectable()
export class VKSessionGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionId = this.extractSessionId(request);

    if (!sessionId) {
      throw new UnauthorizedException('Сессия не найдена');
    }

    const sessionData = await this.sessionService.validateSession(sessionId);

    if (!sessionData) {
      throw new UnauthorizedException('Сессия недействительна или истекла');
    }

    request.user = { id: sessionData.userId };
    return true;
  }

  private extractSessionId(request: any): string | null {
    if (request.headers['x-session-id']) {
      return request.headers['x-session-id'];
    }

    if (request.cookies && request.cookies['session_id']) {
      return request.cookies['session_id'];
    }

    if (request.query && request.query.session_id) {
      return request.query.session_id;
    }

    if (request.headers['cookie']) {
      const cookies = request.headers['cookie'].split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'session_id') {
          return value;
        }
      }
    }

    return null;
  }
}
