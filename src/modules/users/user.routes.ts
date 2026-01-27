import { Router } from "express";
import * as ctrl from "./user.controller";
import { errorHandler } from "@core/errors-handler";
import { checkRole } from "@core/middlewares";
import { getPermissions } from "@core/middlewares";

const userRouter = Router();

// Create a new user
userRouter.post("/", checkRole, errorHandler(ctrl.createUser));
// Get all users
userRouter.get("/", getPermissions, errorHandler(ctrl.findUsers));
// Get user by ID
userRouter.get("/:id", getPermissions, errorHandler(ctrl.findUserById));
// Update user by ID
userRouter.patch("/:id", checkRole, errorHandler(ctrl.updateUser));
// Delete user by ID
userRouter.delete("/:id", getPermissions, errorHandler(ctrl.deleteUser));

export default userRouter;
