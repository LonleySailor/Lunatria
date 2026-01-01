import { HttpException } from '@nestjs/common';

export function createCustomException(
  responseCode: number,
  statusCode: number,
  additionalData?: any,
): never {
  throw new HttpException(
    {
      statusCode,
      responseCode,
      ...additionalData,
    },
    statusCode,
  );
}
