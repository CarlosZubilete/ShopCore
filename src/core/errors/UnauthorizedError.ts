import { ErrorCode, HttpError } from "./HttpError";

export class UnauthorizedError extends HttpError {
  constructor(
    message: string = "Unauthorized",
    errorCode: ErrorCode = ErrorCode.UNAUTHORIZED,
    errors?: unknown,
  ) {
    super(message, 401, errorCode, errors);
  }
}
