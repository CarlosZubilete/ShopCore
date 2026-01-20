import { AuthModel } from "./auth.model";
import { IAuth, IAuthRepository } from "./auth.types";

export class AuthRepository implements IAuthRepository {
  async create(data: Partial<IAuth>): Promise<IAuth> {
    return AuthModel.create(data);
  }

  async findValid(token: string): Promise<IAuth | null> {
    return AuthModel.findOne({ token, revoked: false }).exec();
  }

  async revoke(token: string): Promise<boolean> {
    // console.log("Revoking token:", token);
    const result = await AuthModel.deleteOne({ token }).exec();
    return result.deletedCount === 1;
  }
}
