import { Types } from "mongoose";
import { IUser } from "../users/user.types";

export interface IAuth {
  token: string;
  userId: Types.ObjectId;
  revoked: boolean;
  createdAt: Date;
}

export interface IAuthRepository {
  create(data: Partial<IAuth>): Promise<IAuth>;
  findValid(token: string): Promise<IAuth | null>;
  revoke(token: string): Promise<boolean>;
}

export interface IAuthService {
  login(email: string, password: string): Promise<string>;
  logout(token: string): Promise<boolean>;
  register(data: IUser): Promise<IUser>;
}
