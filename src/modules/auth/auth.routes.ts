import { Router } from "express";
import * as ctrl from "./auth.controller";
import { errorHandler } from "@core/errors-handler";

const authRoutes = Router();

// * Authentication Routes ()
// authRoutes.post("/register", ctrl.register);
authRoutes.post("/login", errorHandler(ctrl.login));

// this has a jwt auth middleware
// authRoutes.post("/logout", errorHandler(ctrl.logout));

export default authRoutes;
