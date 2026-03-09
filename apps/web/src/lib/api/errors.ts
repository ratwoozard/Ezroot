/**
 * API error response (OpenAPI ErrorResponse).
 */
export interface ErrorResponse {
  error_code: string;
  message: string;
  details?: string[];
}

export function isErrorResponse(body: unknown): body is ErrorResponse {
  return (
    typeof body === 'object' &&
    body !== null &&
    'error_code' in body &&
    'message' in body
  );
}

export function getErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === 'string') return m;
  }
  if (isErrorResponse(err)) return err.message;
  return 'Der opstod en fejl';
}
