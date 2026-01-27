import { Router, Response } from "express";
import userRoutes from "@modules/users/user.routes";
import authRoutes from "@modules/auth/auth.routes";
import roleRouter from "@modules/roles/role.routes";
import { getPermissions, verifyToken } from "@core/middlewares";

const router: Router = Router();

router.get("/healthy", (_, res: Response) => {
  res.json({ status: "API is healthy" });
});

router.use("/auth", authRoutes);
router.use("/users", verifyToken, userRoutes);
router.use("/roles", verifyToken, getPermissions, roleRouter);

export default router;
