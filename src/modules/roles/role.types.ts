import { Document } from "mongoose";
import { IRepository } from "../repository";

export interface IRole extends Document {
  name: string;
  permissions: string[];
}

export interface IRoleRepository extends IRepository<IRole> {}

export interface IRoleService {
  createRole(data: IRole): Promise<IRole>;
  findRoles(): Promise<IRole[]>;
  findRoleById(id: string): Promise<IRole | null>;
  updateRole(id: string, data: Partial<IRole>): Promise<IRole | null>;
  deleteRole(id: string): Promise<boolean>;
}
