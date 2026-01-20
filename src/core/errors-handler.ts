import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodError } from "zod";
import {
  HttpError,
  ErrorCode,
  ValidationError,
  InternalError,
} from "./errors/index";

export const errorHandler = (method: RequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await method(req, res, next);
    } catch (error) {
      let errorResponse: HttpError;
      if (error instanceof HttpError) {
        errorResponse = error;
      } else if (error instanceof ZodError) {
        errorResponse = new ValidationError(error);
      } else {
        errorResponse = new InternalError(
          "Internal Server Error",
          ErrorCode.INTERNAL_SERVER_ERROR,
          error,
        );
      }
      res.status(errorResponse.statusCode).json({
        message: errorResponse.message,
        code: errorResponse.errorCode,
        details: errorResponse.errors,
      });
    }
  };
};
