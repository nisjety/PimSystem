import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const path = request.url;

    return next.handle().pipe(
      catchError(error => {
        let response: ErrorResponse;

        if (error instanceof HttpException) {
          const status = error.getStatus();
          const errorResponse = error.getResponse() as any;

          response = {
            statusCode: status,
            message: errorResponse.message || error.message,
            error: errorResponse.error || HttpStatus[status],
            timestamp: new Date().toISOString(),
            path,
          };
        } else {
          this.logger.error(error.message, error.stack);

          response = {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Internal server error',
            error: HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR],
            timestamp: new Date().toISOString(),
            path,
          };
        }

        return throwError(() => new HttpException(response, response.statusCode));
      }),
    );
  }
} 