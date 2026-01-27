import { Query } from "@modules/repository";
import { IRoleService, IRole } from "./role.types";
import { IRoleRepository } from "./role.types";

export class RoleService implements IRoleService {
  private rolesRepository: IRoleRepository;

  constructor(rolesRepository: IRoleRepository) {
    this.rolesRepository = rolesRepository;
  }

  async createRole(data: IRole): Promise<IRole> {
    return this.rolesRepository.create(data);
  }

  async findRoles(query?: Query): Promise<IRole[]> {
    return this.rolesRepository.find(query || {});
  }

  async findRoleById(id: string): Promise<IRole | null> {
    return this.rolesRepository.findById(id);
  }

  async updateRole(id: string, data: Partial<IRole>): Promise<IRole | null> {
    return this.rolesRepository.update(id, data);
  }

  async deleteRole(id: string): Promise<boolean> {
    return this.rolesRepository.delete(id);
  }
}
