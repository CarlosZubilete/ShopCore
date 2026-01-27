import { Response, Request, NextFunction } from "express";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import {
  ConflictError,
  ErrorCode,
  InternalError,
  NotFoundError,
  UnauthorizedError,
} from "@core/errors/index";
import { CreateUserInput, UpdateUserInput } from "./user.schema";
import { IUser } from "./user.types";

const userRepository = new UserRepository();
const userService = new UserService(userRepository);

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userData = CreateUserInput.parse(req.body);
  const newUser = await userService.createUser(userData as IUser);
  if (!newUser)
    return next(
      new InternalError(
        "Failed to create user",
        ErrorCode.INTERNAL_SERVER_ERROR,
        null,
      ),
    );
  res.status(201).json(newUser);
};

export const findUsers = async (
  _: Request,
  res: Response,
  next: NextFunction,
) => {
  const users = await userService.findUsers();
  if (users.length === 0)
    return next(
      new NotFoundError("No users found", ErrorCode.DOCUMENTS_NOT_FOUND),
    );

  res.status(200).json(users);
};

export const findUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = await userService.findUserById(req.params.id as string);
  if (!user)
    return next(
      new NotFoundError("User not found", ErrorCode.DOCUMENT_NOT_FOUND),
    );
  res.status(200).json(user);
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userData = UpdateUserInput.parse(req.body);

  // prevent self-demotion: users cannot change their own roles
  if (req.params.id === req.currentUser.id && userData.roles) {
    return next(
      new ConflictError(
        "User cannot modify their own roles",
        ErrorCode.SELF_DEMOTION,
      ),
    );
  }

  const updatedUser = await userService.updateUser(
    req.params.id as string,
    userData as IUser,
  );
  if (!updatedUser)
    return next(
      new NotFoundError("User not found", ErrorCode.DOCUMENT_NOT_FOUND),
    );

  res.status(200).json(updatedUser);
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // prevent self-deletion: users cannot delete their own account
  if (req.params.id === req.currentUser.id) {
    return next(
      new ConflictError(
        "Users cannot delete their own account",
        ErrorCode.SELF_DEMOTION,
      ),
    );
  }

  const deleted = await userService.deleteUser(req.params.id as string);

  if (!deleted)
    return next(
      new NotFoundError("User not found", ErrorCode.DOCUMENT_NOT_FOUND),
    );

  res.json({ message: "User deleted successfully" });
};
