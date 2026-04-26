// path: backend/src/shared/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../types/response.types';
import { ErrorCode } from '../enums/error-codes.enum';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorCode = this.mapStatusToErrorCode(status);
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || exception.message;

    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: errorCode,
        message: Array.isArray(message) ? message.join(', ') : message,
        details: typeof exceptionResponse === 'object' ? exceptionResponse : undefined,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.warn(
      `HTTP Exception: ${status} - ${request.method} ${request.url}`,
      exception.stack,
    );

    response.status(status).json(errorResponse);
  }

  private mapStatusToErrorCode(status: number): ErrorCode {
    switch (status) {
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ErrorCode.CONFLICT;
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.VALIDATION_ERROR;
      case HttpStatus.SERVICE_UNAVAILABLE:
        return ErrorCode.SERVICE_UNAVAILABLE;
      default:
        return ErrorCode.INTERNAL_ERROR;
    }
  }
}
