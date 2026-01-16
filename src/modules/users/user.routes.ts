import { Router } from "express";
import * as ctrl from "./user.controller";
import { errorHandler } from "@core/errors-handler";

const userRouter = Router();

// Create a new user
userRouter.post("/", errorHandler(ctrl.createUser));
// Get all users
userRouter.get("/", errorHandler(ctrl.findUsers));
// Get user by ID
userRouter.get("/:id", errorHandler(ctrl.findUserById));
// Update user by ID
userRouter.patch("/:id", errorHandler(ctrl.updateUser));
// Delete user by ID
userRouter.delete("/:id", errorHandler(ctrl.deleteUser));

export default userRouter;
