import { HttpError, ErrorCode } from "./HttpError";

export class ForbiddenError extends HttpError {
  constructor(
    message: string = "Permission denied to perform this action",
    errorCode: ErrorCode = ErrorCode.FORBIDDEN,
    errors?: unknown,
  ) {
    super(message, 403, errorCode, errors);
  }
}
