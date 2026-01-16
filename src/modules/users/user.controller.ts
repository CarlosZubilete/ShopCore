import { Response, Request, NextFunction } from "express";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import { ErrorCode, InternalError, NotFoundError } from "@core/errors/index";
import { UserSchema, UpdateUserSchema } from "./user.schema";

const userRepository = new UserRepository();
const userService = new UserService(userRepository);

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userData = UserSchema.parse(req.body);
  const newUser = await userService.createUser(userData);
  if (!newUser)
    return next(new InternalError("Failed to create user", 500, null));
  res.status(201).json(newUser);
};

export const findUsers = async (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  const users = await userService.findUsers();
  if (users.length === 0)
    return next(
      new NotFoundError("No users found", ErrorCode.DOCUMENTS_NOT_FOUND)
    );

  res.status(200).json(users);
};

export const findUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await userService.findUserById(req.params.id as string);
  if (!user)
    return next(
      new NotFoundError("User not found", ErrorCode.DOCUMENT_NOT_FOUND)
    );
  res.status(200).json(user);
};

export const updateUser = async (req: Request, res: Response) => {
  const userData = UpdateUserSchema.parse(req.body);
  const updatedUser = await userService.updateUser(
    req.params.id as string,
    userData
  );
  if (!updatedUser) return res.status(404).json({ error: "User not found" });
  res.status(200).json(updatedUser);
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const deleted = await userService.deleteUser(req.params.id as string);
  if (!deleted)
    return next(
      new NotFoundError("User not found", ErrorCode.DOCUMENT_NOT_FOUND)
    );
  res.json({ message: "User deleted successfully" });
};
