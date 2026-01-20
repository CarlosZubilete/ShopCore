import { Router } from "express";
import * as ctrl from "./auth.controller";
import { errorHandler } from "@core/errors-handler";
import { verifyToken } from "@core/middlewares";

const authRoutes = Router();

authRoutes.post("/register", errorHandler(ctrl.register));
authRoutes.post("/login", errorHandler(ctrl.login));
authRoutes.post("/logout", verifyToken, errorHandler(ctrl.logout));

export default authRoutes;
