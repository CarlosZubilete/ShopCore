import { Request, Response, NextFunction } from "express";
import { permissions, Method, Scope } from "@modules/permission.type";
import { ForbiddenError, InternalError, ErrorCode } from "@core/errors";

export const getPermissions = async (
  req: Request,
  _: Response,
  next: NextFunction,
) => {
  try {
    const { currentUser, method } = req;
    // Use originalUrl to get the full path, not just the relative path
    const fullPath = req.originalUrl.split("?")[0]; // Remove query params

    const { roles } = currentUser;

    // extract the module from the path
    const currentModule = fullPath.replace(/^\/api\/v1\/([^\/]+).*/, "$1");
    // console.log("1. Current Module Extracted:", currentModule);

    // get permissions for the method that matches the current HTTP method
    const baseMethod = permissions.find(
      (p) => p.method === Method[method as keyof typeof Method],
    );

    // console.log("baseMethod:", baseMethod);
    // Create a copy of the permission object to avoid mutating the global array
    const findMethod = baseMethod
      ? {
          ...baseMethod,
          permissions: [...baseMethod.permissions], // Create a new array, don't mutate the original
        }
      : undefined;

    // build the permission according to module and scope
    if (
      !findMethod?.permissions.includes(`${currentModule}_${findMethod.scope}`)
    )
      findMethod?.permissions.push(`${currentModule}_${findMethod.scope}`);

    console.log("Found Method:", findMethod);

    // get permissions from the user's roles, not roles repeat
    const mergedRolesPermissions = [
      ...new Set(roles?.flatMap((x) => x.permissions)),
    ];

    //  console.log("4. Merged Role Permissions:", mergedRolesPermissions);

    // Verify if the user has permissions.
    // If user has individual permissions, use them; otherwise, use role permissions
    let userPermissions: string[] = [];
    if (currentUser.permissions?.length !== 0)
      userPermissions = currentUser.permissions!;
    else userPermissions = mergedRolesPermissions;

    console.log("5. User Permissions:", userPermissions);

    // Compare the permissions required for the method and the user's permissions
    const permissionGranted = findMethod?.permissions.find((p) =>
      userPermissions.includes(p),
    );

    //  console.log("6. Permission Granted:", permissionGranted);

    if (!permissionGranted)
      return next(
        new ForbiddenError("Insufficient permissions", ErrorCode.FORBIDDEN),
      );

    next();
  } catch (error) {
    // console.error("Permission check error:", error);
    return next(
      new InternalError(
        "Permission validation failed",
        ErrorCode.INTERNAL_SERVER_ERROR,
      ),
    );
  }
};
