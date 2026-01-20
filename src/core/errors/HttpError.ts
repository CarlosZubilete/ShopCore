export enum ErrorCode {
  DOCUMENT_NOT_FOUND = 1001,
  DOCUMENTS_NOT_FOUND = 1002,
  DOCUMENT_ALREADY_EXISTS = 1011,
  // UNPROCESSABLE_ENTITY = 2002,
  INTERNAL_SERVER_ERROR = 3001,
  INVALID_CREDENTIALS = 4001,
  UNAUTHORIZED = 4003,
  USER_NOT_FOUND = 6001,
  // SELF_DEMOTION = 7001,
  VALIDATION_ERROR = 10001,
}

export class HttpError extends Error {
  message: string;
  statusCode: number;
  errorCode: ErrorCode;
  errors: any;

  constructor(
    message: string,
    statusCode: number,
    errorCode: ErrorCode,
    errors?: any,
  ) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
  }
}
