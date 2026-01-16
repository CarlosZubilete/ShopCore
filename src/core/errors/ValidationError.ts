import { ZodError, ZodIssue } from "zod";
import { ErrorCode, HttpError } from "./HttpError";

interface IValidationError {
  field: string;
  message: string;
}

export class ValidationError extends HttpError {
  constructor(zodError: ZodError) {
    // Extract only the essential error messages from Zod's error object
    const formattedErrors: IValidationError[] = zodError.issues.map(
      (error: ZodIssue) => ({
        field: error.path.join("."),
        message: error.message,
      })
    );
    super(
      "Validation failed",
      400,
      ErrorCode.VALIDATION_ERROR,
      formattedErrors
    );
  }
}
