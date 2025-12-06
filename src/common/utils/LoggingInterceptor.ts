import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, body, query, params } = request;
    const now = Date.now();

    // ----------------------------------------------------
    // لاگ کردن مقادیر ورودی: Body, Query Params, Route Params
    // ----------------------------------------------------
    this.logger.log(`
>>> INCOMING REQUEST <<<
Method: ${method}${url}
Query Params: ${JSON.stringify(query)}
Route Params: ${JSON.stringify(params)}
Body:
${JSON.stringify(body)}
    `);
    
    // ----------------------------------------------------
    // ادامه اجرای کنترلر
    // ----------------------------------------------------
    return next.handle().pipe(
      // ----------------------------------------------------
      // لاگ کردن پاسخ خروجی و زمان سپری شده
      // ----------------------------------------------------
      tap(data => {
        const delay = Date.now() - now;
        const statusCode = response.statusCode;

        this.logger.log(`
<<< OUTGOING RESPONSE >>>
Method: ${method}${url} - Status: ${statusCode} - Latency: ${delay}ms
Response Data:
${JSON.stringify(data)} 
        `);
      }),
    );
  }
}