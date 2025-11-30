import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, catchError } from 'rxjs';
import { WinstonLogger } from '../logger/winston-logger.service';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  constructor(private readonly logger: WinstonLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const path = req?.url;

    return next.handle().pipe(
      catchError((err) => {
        // For HttpException preserve status and message
        if (err instanceof HttpException) {
          const status = err.getStatus();
          const response = err.getResponse();
          const message =
            typeof response === 'string'
              ? response
              : (response as any).message || err.message;

          this.logger.warn(
            `HttpException: ${err.message}`,
            JSON.stringify({ status, path }),
          );
          throw err;
        }

        // Unexpected errors
        this.logger.error(
          'Unhandled exception',
          err.stack || err.message,
          'ErrorInterceptor',
        );

        const errorResponse = {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
          message: 'An unexpected error occurred.',
          timestamp: new Date().toISOString(),
          path,
        };

        throw new HttpException(
          errorResponse,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }),
    );
  }
}
