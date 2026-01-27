import { UnauthorizedError, ErrorCode, InternalError } from "@core/errors";
import { Request, Response, NextFunction } from "express";
import { AuthRepository } from "@modules/auth/auth.repository";
import { verifyJwt } from "@core/utils/jwt";
import { UserService, UserRepository, IUser } from "@modules/users";

const authRepository = new AuthRepository();
// Initialize UserService to fetch user details
const userRepository = new UserRepository();
// const userService = new UserService(userRepository);

export const verifyToken = async (
  req: Request,
  _: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.access_token;
    if (!token)
      return next(
        new UnauthorizedError(
          "Invalid credentials",
          ErrorCode.INVALID_CREDENTIALS,
        ),
      );

    const payload = verifyJwt(token);

    // Get session with populated user data
    const session = await authRepository.findValid(token);

    if (!session)
      return next(
        new UnauthorizedError(
          "Invalid credentials",
          ErrorCode.INVALID_CREDENTIALS,
        ),
      );

    req.currentUser = (await userRepository.findById(payload.sub)) as IUser;

    // console.log("Verified user:", req.currentUser);
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return next(
      new InternalError("Token verification failed", ErrorCode.TOKEN_EXPIRED),
    );
  }
};
