import { ErrorCode, HttpError } from "./HttpError";

export class BadRequestError extends HttpError {
  constructor(message: string, errorCode: ErrorCode) {
    super(message, 400, errorCode, null);
  }
}
