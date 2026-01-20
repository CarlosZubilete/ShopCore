import { ErrorCode, HttpError } from "./HttpError";

export class UnauthorizedError extends HttpError {
  constructor(message: string, errorCode: ErrorCode) {
    super(message, 401, errorCode, null);
  }
}
