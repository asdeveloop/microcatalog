// path: backend/src/shared/decorators/api-paginated-response.decorator.ts
import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginatedResponseDto, PaginationMetaDto } from '../dto/pagination.dto';

export const ApiPaginatedResponse = <TModel extends Type<unknown>>(model: TModel) => {
  return applyDecorators(
    ApiExtraModels(PaginatedResponseDto, PaginationMetaDto, model),
    ApiOkResponse({
      schema: {
        allOf: [
          {
            properties: {
              items: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              meta: {
                $ref: getSchemaPath(PaginationMetaDto),
              },
            },
          },
        ],
      },
    }),
  );
};
