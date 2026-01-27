import { HttpError, ErrorCode } from "./HttpError";

export class ConflictError extends HttpError {
  constructor(message: string, errorCode: ErrorCode) {
    super(message, 409, errorCode);
  }
}
