import { Request, Response, NextFunction } from "express";
import { RoleRepository, RoleService, IRole } from "@modules/roles";
import { ErrorCode, BadRequestError, InternalError } from "@core/errors";

const roleRepository = new RoleRepository();
const roleService = new RoleService(roleRepository);

export const checkRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // extract roles from request or default "guest"
    const roles: string[] = req.body && req.body?.roles ? req.body.roles : [];
    // validate is roles is array and not empty, else assign "guest"
    const role = Array.isArray(roles) && roles.length !== 0 ? roles : ["guest"];
    // check if roles exist in the database
    const foundRoles = await roleService.findRoles({
      name: { $in: role },
    });

    if (foundRoles.length === 0)
      return next(
        new BadRequestError("Role not found", ErrorCode.DOCUMENTS_NOT_FOUND),
      );

    // Convert Role documents to their MongoDB IDs
    req.body.roles = foundRoles.map((r) => r._id);

    console.log("Assigned role IDs:", req.body.roles);

    next();
  } catch (error) {
    console.error("Role check error:", error);
    return next(
      new InternalError(
        "Role validation failed",
        ErrorCode.INTERNAL_SERVER_ERROR,
      ),
    );
  }
};
