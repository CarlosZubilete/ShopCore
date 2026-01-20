import { IUserRepository } from "@modules/users";
import { IAuthRepository, IAuthService } from "./auth.types";
import { BadRequestError, ErrorCode } from "@core/errors";
import { signJwt } from "@core/utils/jwt";
import { comparePassword } from "@core/utils/hash";
import { IUser } from "@modules/users/user.types";

export class AuthService implements IAuthService {
  constructor(
    private userRepository: IUserRepository,
    private authRepository: IAuthRepository,
  ) {}

  async login(email: string, password: string): Promise<string> {
    const user = await this.userRepository.findOne({ email });

    if (!user || !(await comparePassword(password, user.password)))
      throw new BadRequestError(
        "Invalid credentials",
        ErrorCode.INVALID_CREDENTIALS,
      );

    const token = signJwt({ sub: user._id });

    // console.log("Creating auth token", token);

    await this.authRepository.create({
      token,
      userId: user._id,
    });

    return token;
  }

  async logout(token: string): Promise<boolean> {
    // console.log("Logging out token in service:", token);
    // console.log("================================");
    return await this.authRepository.revoke(token);
  }

  async register(data: IUser): Promise<IUser> {
    return this.userRepository.create(data);
  }
}
