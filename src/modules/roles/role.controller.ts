import { Request, Response, NextFunction } from "express";
import { RoleRepository } from "./role.repository";
import { RoleService } from "./role.service";
import { ErrorCode, InternalError, NotFoundError } from "@core/errors";

const roleRepository = new RoleRepository();
const roleService = new RoleService(roleRepository);

export const createRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // todo: validate with zod schema ...
  const role = await roleService.createRole(req.body);

  if (!role)
    return next(
      new InternalError(
        "Failed to create role",
        ErrorCode.INTERNAL_SERVER_ERROR,
        500,
      ),
    );

  res.status(201).json(role);
};

export const findRoles = async (
  _: Request,
  res: Response,
  next: NextFunction,
) => {
  const roles = await roleService.findRoles();

  if (roles.length === 0)
    return next(
      new NotFoundError("No roles found", ErrorCode.DOCUMENTS_NOT_FOUND),
    );

  res.status(200).json(roles);
};

export const findRoleById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const role = await roleService.findRoleById(req.params.id as string);

  if (!role)
    return next(
      new NotFoundError("Role not found", ErrorCode.DOCUMENT_NOT_FOUND),
    );

  res.status(200).json(role);
};

export const updateRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // todo: validate with zod schema ...
  const role = await roleService.updateRole(req.params.id as string, req.body);

  if (!role)
    return next(
      new NotFoundError("Role not found", ErrorCode.DOCUMENT_NOT_FOUND),
    );

  res.status(200).json(role);
};

export const deleteRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const deleted = await roleService.deleteRole(req.params.id as string);

  if (!deleted)
    return next(
      new NotFoundError("Role not found", ErrorCode.DOCUMENT_NOT_FOUND),
    );

  res.status(200).json({ message: "Role deleted successfully" });
};
