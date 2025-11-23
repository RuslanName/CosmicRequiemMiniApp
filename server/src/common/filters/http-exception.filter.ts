import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        message = (exceptionResponse as any).message || exception.message;
      } else {
        message = exception.message;
      }

      if (
        status === HttpStatus.UNAUTHORIZED &&
        exception instanceof UnauthorizedException
      ) {
        const errorMessage =
          typeof message === 'string' ? message.toLowerCase() : '';

        if (
          !request.headers.authorization &&
          !request.cookies?.admin_token &&
          !this.isAuthRoute(request.path)
        ) {
          status = HttpStatus.NOT_FOUND;
          message = `Cannot ${request.method} ${request.path}`;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    });
  }

  private isAuthRoute(path: string): boolean {
    const authRoutes = ['/auth', '/admin/auth', '/login'];
    return authRoutes.some((route) => path.startsWith(route));
  }
}
