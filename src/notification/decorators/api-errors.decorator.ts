import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { ErrorCommonResponse } from '../dto/error.dto';

export function ApiStandardErrors() {
  return applyDecorators(
    ApiBadRequestResponse({ type: ErrorCommonResponse, description: 'Invalid input data / Validation failed.' }),
    ApiUnauthorizedResponse({ type: ErrorCommonResponse, description: 'Missing or invalid authentication token.' }),
    ApiForbiddenResponse({ type: ErrorCommonResponse, description: 'You do not have permission to access this resource.' }),
    ApiNotFoundResponse({ type: ErrorCommonResponse, description: 'The requested resource could not be found.' }),
    ApiInternalServerErrorResponse({ type: ErrorCommonResponse, description: 'An unexpected error occurred on the server.' }),
  );
}
