import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponse, ERROR_CODES } from '@ezroot/shared';

@Catch()
export class ErrorResponseFilter implements ExceptionFilter {
  private readonly logger = new Logger(ErrorResponseFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: ErrorResponse = {
      error_code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resp = exception.getResponse();
      if (typeof resp === 'object' && resp !== null && 'error_code' in resp) {
        body = resp as ErrorResponse;
      } else if (typeof resp === 'object' && resp !== null && 'message' in resp) {
        const m = resp as { message?: string | string[] };
        body = {
          error_code: mapStatusToErrorCode(status),
          message: Array.isArray(m.message) ? m.message[0] : (m.message ?? 'Request failed'),
        };
      } else {
        body = {
          error_code: mapStatusToErrorCode(status),
          message: typeof resp === 'string' ? resp : 'Request failed',
        };
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
      if (process.env.NODE_ENV !== 'production') {
        body.message = exception.message;
      }
    }

    res.status(status).json(body);
  }
}

function mapStatusToErrorCode(status: number): string {
  switch (status) {
    case 400:
    case 409:
      return ERROR_CODES.INVALID_INPUT;
    case 401:
      return ERROR_CODES.UNAUTHORIZED;
    case 403:
      return ERROR_CODES.FORBIDDEN;
    case 404:
      return ERROR_CODES.NOT_FOUND;
    case 503:
      return ERROR_CODES.SERVICE_UNAVAILABLE;
    default:
      return 'INTERNAL_ERROR';
  }
}
