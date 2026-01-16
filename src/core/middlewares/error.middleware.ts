import { Request, Response, NextFunction } from "express";
import { HttpError } from "@core/errors";

export const errorMiddleware = (
  error: any,
  _: Request,
  res: Response,
  next: NextFunction
) => {
  // If response already sent, skip
  if (res.headersSent) return next(error);

  if (error instanceof HttpError) {
    const response: any = {
      message: error.message,
      errorCode: error.errorCode,
    };

    // Only include errors field if there are actual errors
    if (error.errors) {
      response.errors = error.errors;
    }

    return res.status(error.statusCode).json(response);
  }

  // For any other unexpected errors
  console.error("Unhandled error:", error);
  res.status(500).json({
    message: "Internal Server Error",
    errorCode: 3001,
  });
};
