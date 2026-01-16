import { ErrorCode, HttpError } from "./HttpError";

export class NotFoundError extends HttpError {
  constructor(message: string, errorCode: ErrorCode) {
    super(message, 404, errorCode, null);
  }
}
