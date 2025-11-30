import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { WinstonLogger } from '../logger/winston-logger.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: WinstonLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.originalUrl || req.url;
    const start = Date.now();

    // Avoid logging sensitive bodies
    const safeBody = { ...req.body };
    if (safeBody?.password) safeBody.password = '********';

    this.logger.log(`Incoming request: ${method} ${url}`, 'HTTP');

    return next.handle().pipe(
      tap({
        next: (res) => {
          const ms = Date.now() - start;
          const status = context.switchToHttp().getResponse().statusCode;
          this.logger.log(`${method} ${url} ${status} - ${ms}ms`, 'HTTP');
        },
      }),
    );
  }
}
