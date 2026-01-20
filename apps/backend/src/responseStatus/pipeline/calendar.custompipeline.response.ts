import {
  BadRequestException,
  ValidationPipe,
  ValidationError,
} from '@nestjs/common';
import { ValidationErrorCode, VALIDATION_ERROR_CODE_MAP } from '../response-codes.enum';

export const CustomValidationPipe = new ValidationPipe({
  exceptionFactory: (errors: ValidationError[]) => {
    return new BadRequestException({
      statusCode: 400,
      code: ValidationErrorCode.VALIDATION_ERROR_BASE,
      errors: errors.map((err) => ({
        field: err.property,
        code: VALIDATION_ERROR_CODE_MAP[Object.keys(err.constraints || {})[0]] || 999, // Default to 999 if not mapped
        issues: Object.values(err.constraints || {}), // Actual error messages
      })),
    });
  },
});
