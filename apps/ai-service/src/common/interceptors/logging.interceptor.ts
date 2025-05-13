import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Request, Response } from "express";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();

    // Log the incoming request
    this.logger.log({
      type: "Request",
      method: request.method,
      url: request.url,
      body: request.body,
      query: request.query,
      headers: request.headers,
    });

    return next.handle().pipe(
      tap({
        next: (data: any) => {
          const responseTime = Date.now() - startTime;

          // Log the response
          this.logger.log({
            type: "Response",
            method: request.method,
            url: request.url,
            statusCode: response.statusCode,
            responseTime: `${responseTime}ms`,
            body: typeof data === "object" ? data : undefined,
          });
        },
        error: (error: any) => {
          const responseTime = Date.now() - startTime;

          // Log the error response
          this.logger.error({
            type: "Error Response",
            method: request.method,
            url: request.url,
            statusCode: response.statusCode,
            responseTime: `${responseTime}ms`,
            error: {
              message: error.message,
              stack: error.stack,
            },
          });
        },
      }),
    );
  }
}
