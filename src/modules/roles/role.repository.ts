import { RoleModel } from "./role.model";
import { IRoleRepository, IRole } from "./role.types";
import { Query } from "@modules/repository";

export class RoleRepository implements IRoleRepository {
  async create(data: IRole): Promise<IRole> {
    const newRole = new RoleModel(data);
    return await newRole.save();
  }

  async find(query?: Query): Promise<IRole[]> {
    return await RoleModel.find(query || {}).exec();
  }

  async findById(id: string): Promise<IRole | null> {
    return await RoleModel.findById(id).exec();
  }

  async update(id: string, data: Partial<IRole>): Promise<IRole | null> {
    return await RoleModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await RoleModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
