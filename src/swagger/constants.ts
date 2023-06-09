import { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const SWAGGER_API_ROOT = 'api/docs';
export const SWAGGER_API_NAME = 'Simple API';
export const SWAGGER_API_DESCRIPTION = 'Simple API Description';
export const SWAGGER_API_CURRENT_VERSION = '1.0';
export const SWAGGER_API_AUTH_NAME = 'Authorization';
export const SWAGGER_API_AUTH_LOCATION = 'header';
export const SWAGGER_API_AUTH: SecuritySchemeObject = {
  type: 'http',
  scheme: 'bearer', 
  bearerFormat: 'JWT',
};
export const SWAGGER_API_AUTH_TYPE = 'access-token';