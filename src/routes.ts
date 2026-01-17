import { Router, Response } from "express";
import userRoutes from "@modules/users/user.routes";
import authRoutes from "@modules/auth/auth.routes";

const router: Router = Router();

router.get("/healthy", (_, res: Response) => {
  res.json({ status: "API is healthy" });
});

router.use("/users", userRoutes);
router.use("/auth", authRoutes);

export default router;
