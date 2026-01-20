import { IUser } from "@modules/users";

declare global {
  namespace Express {
    interface Request {
      currentUser: IUser;
    }
  }
}

export {};
