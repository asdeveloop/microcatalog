import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseResponseDto } from '../dto/base-response.dto';

interface TransformedResponse<T> {
  success: true;
  data: T;
  meta: Record<string, unknown>;
  timestamp: string;
  statusCode: number;
}

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, TransformedResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<TransformedResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode || HttpStatus.OK;

    return next.handle().pipe(
      map((data: T) => {
        // If controller already returned BaseResponseDto, pass through
        if (data instanceof BaseResponseDto) {
          return {
            success: true,
            data: data.data as T,
            meta: (data.meta as Record<string, unknown>) ?? {},
            timestamp: new Date().toISOString(),
            statusCode,
          };
        }

        // Wrap raw data in standard envelope
        return {
          success: true,
          data,
          meta: {},
          timestamp: new Date().toISOString(),
          statusCode,
        };
      }),
    );
  }
}
