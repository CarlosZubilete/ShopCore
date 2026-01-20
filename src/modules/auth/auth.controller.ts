import { Request, Response } from "express";
import { IUser, UserRepository, UserService } from "@modules/users";
import { LoginInput } from "./auth.schema";
import { CreateUserInput } from "@modules/users/user.schema";
import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";
import { setAuthCookie, clearAuthCookie } from "@core/utils/cookies";

const authRepository = new AuthRepository();
const userRepository = new UserRepository();
const authService = new AuthService(userRepository, authRepository);

export const login = async (req: Request, res: Response) => {
  const { email, password } = LoginInput.parse(req.body); // schema validation form users modules

  const token = await authService.login(email, password);
  const user = await userRepository.findOne({ email });

  setAuthCookie(res, token);

  // Return user info excluding sensitive data
  res.json({ sub: user?._id, email: user?.email, username: user?.username });
};

export const register = async (req: Request, res: Response) => {
  const data = CreateUserInput.parse(req.body);
  const newUser = await authService.register(data as IUser);

  res.status(201).json(newUser);
};

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies.access_token;

  // console.log("Logging out token:", token);
  const result = await authService.logout(token);

  if (!result) {
    return res.status(400).json({ message: "Failed to logout" });
  }

  clearAuthCookie(res);

  res.status(200).json({ message: "Logged out successfully" });
};
