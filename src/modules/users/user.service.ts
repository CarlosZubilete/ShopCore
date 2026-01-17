import { IUser, IUserService, IUserRepository } from "./user.types";

export class UserService implements IUserService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async createUser(data: IUser): Promise<IUser> {
    return this.userRepository.create(data);
  }

  async findUsers(): Promise<IUser[]> {
    return this.userRepository.find();
  }

  async findUserById(id: string): Promise<IUser | null> {
    return this.userRepository.findById(id);
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    return this.userRepository.findOne({ email });
  }

  async updateUser(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return this.userRepository.update(id, data);
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.userRepository.delete(id);
  }
}
