export enum ErrorCode {
  DOCUMENT_NOT_FOUND = 1001,
  DOCUMENTS_NOT_FOUND = 1002,
  DOCUMENT_ALREADY_EXISTS = 1011,
  TOKEN_EXPIRED = 2002,
  INTERNAL_SERVER_ERROR = 3001,
  UNAUTHORIZED = 4001,
  FORBIDDEN = 4002,
  INVALID_CREDENTIALS = 4003,
  USER_NOT_FOUND = 6001,
  SELF_DEMOTION = 7001,
  VALIDATION_ERROR = 10001,
}

export class HttpError extends Error {
  readonly statusCode: number;
  readonly errorCode: ErrorCode;
  readonly errors?: unknown;

  constructor(
    message: string,
    statusCode: number,
    errorCode: ErrorCode,
    errors?: unknown,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, this.constructor);

    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
  }
}
