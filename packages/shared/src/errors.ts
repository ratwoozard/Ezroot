/**
 * ErrorResponse envelope (OpenAPI components/schemas/ErrorResponse).
 */

export interface ErrorResponse {
  error_code: string;
  message: string;
  details?: string[];
}

export const ERROR_CODES = {
  INVALID_INPUT: 'INVALID_INPUT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;
