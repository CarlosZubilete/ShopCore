import { HttpError, ErrorCode } from "./HttpError";

export class InternalError extends HttpError {
  constructor(
    message: string,
    errorCode: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR,
    errors?: unknown,
  ) {
    super(message, 500, errorCode, errors);
  }
}
