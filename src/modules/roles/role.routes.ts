import { Router } from "express";
import * as ctrl from "./role.controller";
import { errorHandler } from "@core/errors-handler";

const roleRouter = Router();

// Create a new role
roleRouter.post("/", errorHandler(ctrl.createRole));
// Get all roles
roleRouter.get("/", errorHandler(ctrl.findRoles));
// Get role by ID
roleRouter.get("/:id", errorHandler(ctrl.findRoleById));
// Update role by ID
roleRouter.patch("/:id", errorHandler(ctrl.updateRole));
// Delete role by ID
roleRouter.delete("/:id", errorHandler(ctrl.deleteRole));

export default roleRouter;
