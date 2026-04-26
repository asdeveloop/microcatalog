// path: backend/src/shared/filters/all-exceptions.filter.ts
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

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException ? exception.message : 'Internal server error';

    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message,
        details: process.env.NODE_ENV === 'development' ? exception : undefined,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.error(
      `Unhandled Exception: ${status} - ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : exception,
    );

    response.status(status).json(errorResponse);
  }
}
