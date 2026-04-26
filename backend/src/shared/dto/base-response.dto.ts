// path: backend/src/shared/dto/base-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { ErrorCode } from '../enums/error-codes.enum';

export class ApiErrorDto {
  @ApiProperty({ enum: ErrorCode })
  code: ErrorCode;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  details?: unknown;
}

export class BaseResponseDto<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ required: false })
  data?: T;

  @ApiProperty({ type: ApiErrorDto, required: false })
  error?: ApiErrorDto;

  @ApiProperty()
  timestamp: string;

  @ApiProperty({ required: false })
  path?: string;
}
