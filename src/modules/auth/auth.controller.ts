import { Request, Response, NextFunction } from "express";
import { JWT_SECRET } from "@config/env";
import jwt from "jsonwebtoken";
import {
  IUserRepository,
  IUserService,
  UserRepository,
  UserService,
} from "@modules/users";
import { BadRequestError, ErrorCode } from "@core/errors";

const userRepository: IUserRepository = new UserRepository();
const userService: IUserService = new UserService(userRepository);

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  const user = await userService.findUserByEmail(email);
  if (!user)
    return next(
      new BadRequestError(
        "Invalid user or password",
        ErrorCode.INVALID_CREDENTIALS
      )
    );

  const hashMatch = await user.comparePassword(password);
  if (!hashMatch)
    return next(
      new BadRequestError(
        "Invalid user or password",
        ErrorCode.INVALID_CREDENTIALS
      )
    );

  const token = jwt.sign(
    { id: user._id, email: user.email, username: user.username },
    JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );

  res.json({ message: "Login successful", token });
};

// export const register = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { email } = req.body;

//   const existingUser = await userService.findUserByEmail(email);
//   if (existingUser)
//     return next(
//       new BadRequestError(
//         "User with this email already exists",
//         ErrorCode.DOCUMENT_ALREADY_EXISTS
//       )
//     );

//   const newUser = await userService.createUser(req.body);
//   if (!newUser)
//     return next(
//       new BadRequestError(
//         "Failed to register user",
//         ErrorCode.INTERNAL_SERVER_ERROR
//       )
//     );

//   res
//     .status(201)
//     .json({ message: "User registered successfully", user: newUser });
// };
