import { IUser, IUserRepository } from "./user.types";
import { UserModel } from "./user.model";
import { Query } from "../repository";

export class UserRepository implements IUserRepository {
  async create(data: IUser): Promise<IUser> {
    const newUser = new UserModel(data);
    return await newUser.save();
  }

  async find(query?: Query): Promise<IUser[]> {
    return await UserModel.find(query || {}).exec();
  }

  async findOne(query: Query): Promise<IUser | null> {
    return await UserModel.findOne(query).exec();
  }

  async findById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id).exec();
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
