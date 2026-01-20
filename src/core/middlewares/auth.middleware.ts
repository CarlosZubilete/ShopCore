import { ErrorCode, UnauthorizedError } from "@core/errors";
import { Request, Response, NextFunction } from "express";
import { AuthRepository } from "@modules/auth/auth.repository";
import { verifyJwt } from "@core/utils/jwt";
import { IUser } from "@modules/users";

const authRepository = new AuthRepository();

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.access_token;
  if (!token)
    return next(
      new UnauthorizedError("Invalid credentials", ErrorCode.UNAUTHORIZED),
    );

  const payload = verifyJwt(token);

  const session = await authRepository.findValid(token);
  if (!session)
    return next(
      new UnauthorizedError("Invalid credentials", ErrorCode.UNAUTHORIZED),
    );

  req.currentUser = { id: payload.sub } as IUser; // Minimal user object with only id

  next();
};
