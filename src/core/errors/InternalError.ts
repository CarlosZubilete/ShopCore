import { HttpError } from "./HttpError";

export class InternalError extends HttpError {
  constructor(message: string, errorCode: number, errors: any) {
    super(message, 500, errorCode, errors);
  }
}
