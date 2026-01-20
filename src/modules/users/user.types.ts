import { IRepository, Query } from "../repository";
import { Document } from "mongoose";

export interface IUser extends Document {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  comparePassword(password: string): Promise<boolean>;
}

export interface IUserRepository extends IRepository<IUser> {
  findOne(query: Query): Promise<IUser | null>;
}

export interface IUserService {
  createUser(data: IUser): Promise<IUser>;
  findUsers(query?: Query): Promise<IUser[]>;
  findUserById(id: string): Promise<IUser | null>;
  findUserByEmail(email: string): Promise<IUser | null>;
  updateUser(id: string, data: Partial<IUser>): Promise<IUser | null>;
  deleteUser(id: string): Promise<boolean>;
}
