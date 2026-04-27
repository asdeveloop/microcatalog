import { Test, TestingModule } from '@nestjs/testing';
import { TransformResponseInterceptor } from './transform-response.interceptor';
import { ExecutionContext, CallHandler, HttpStatus } from '@nestjs/common';
import { of } from 'rxjs';
import { BaseResponseDto } from '../dto/base-response.dto';

describe('TransformResponseInterceptor', () => {
  let interceptor: TransformResponseInterceptor<unknown>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransformResponseInterceptor],
    }).compile();

    interceptor = module.get<TransformResponseInterceptor<unknown>>(
      TransformResponseInterceptor,
    );
  });

  function createMockContext(
    statusCode: number = HttpStatus.OK,
  ): ExecutionContext {
    const mockResponse = { statusCode };
    const mockRequest = {};
    return {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
      getType: () => 'http',
      getClass: () => ({} as never),
      getHandler: () => ({} as never),
      getArgs: () => [],
      getArgByIndex: () => null,
      switchToRpc: () => ({} as never),
      switchToWs: () => ({} as never),
    } as ExecutionContext;
  }

  function createMockCallHandler<T>(data: T): CallHandler<T> {
    return {
      handle: () => of(data),
    };
  }

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should wrap a plain object in the standard envelope', (done) => {
    const context = createMockContext(HttpStatus.OK);
    const handler = createMockCallHandler({ id: 1, name: 'test' });

    interceptor.intercept(context, handler).subscribe({
      next: (result) => {
        expect(result).toMatchObject({
          success: true,
          data: { id: 1, name: 'test' },
          meta: {},
          statusCode: HttpStatus.OK,
        });
        expect(typeof result.timestamp).toBe('string');
        done();
      },
      error: done,
    });
  });

  it('should wrap an array in the standard envelope', (done) => {
    const context = createMockContext(HttpStatus.OK);
    const handler = createMockCallHandler([1, 2, 3]);

    interceptor.intercept(context, handler).subscribe({
      next: (result) => {
        expect(result).toMatchObject({
          success: true,
          data: [1, 2, 3],
          meta: {},
          statusCode: HttpStatus.OK,
        });
        done();
      },
      error: done,
    });
  });

  it('should pass through already-formatted BaseResponseDto', (done) => {
    const context = createMockContext(HttpStatus.CREATED);
    const dto = new BaseResponseDto(
      { id: 42 },
      { page: 1, limit: 10 },
    );
    const handler = createMockCallHandler(dto);

    interceptor.intercept(context, handler).subscribe({
      next: (result) => {
        expect(result).toMatchObject({
          success: true,
          data: { id: 42 },
          meta: { page: 1, limit: 10 },
          statusCode: HttpStatus.CREATED,
        });
        done();
      },
      error: done,
    });
  });

  it('should return statusCode 201 for created resources', (done) => {
    const context = createMockContext(HttpStatus.CREATED);
    const handler = createMockCallHandler({ created: true });

    interceptor.intercept(context, handler).subscribe({
      next: (result) => {
        expect(result.statusCode).toBe(HttpStatus.CREATED);
        done();
      },
      error: done,
    });
  });
});
