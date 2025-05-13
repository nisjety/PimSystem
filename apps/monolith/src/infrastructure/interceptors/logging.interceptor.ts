import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params } = request;
    const userAgent = request.get('user-agent') || '';
    const timestamp = new Date().toISOString();

    // Log the request
    this.logger.log(
      `[${timestamp}] ${method} ${url} - User-Agent: ${userAgent}`,
    );

    if (Object.keys(body).length > 0) {
      this.logger.debug('Request Body:', body);
    }

    if (Object.keys(query).length > 0) {
      this.logger.debug('Query Params:', query);
    }

    if (Object.keys(params).length > 0) {
      this.logger.debug('Route Params:', params);
    }

    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: (data: any) => {
          const response = context.switchToHttp().getResponse();
          const delay = Date.now() - now;

          this.logger.log(
            `[${timestamp}] ${method} ${url} ${response.statusCode} - ${delay}ms`,
          );

          if (data) {
            this.logger.debug('Response:', data);
          }
        },
        error: (error: any) => {
          const delay = Date.now() - now;

          this.logger.error(
            `[${timestamp}] ${method} ${url} ${error.status || 500} - ${delay}ms`,
            error.stack,
          );
        },
      }),
    );
  }
} 