import { Router, Response } from "express";
import userRoutes from "@modules/users/user.routes";

const router: Router = Router();

router.get("/healthy", (_, res: Response) => {
  res.json({ status: "API is healthy" });
});

router.use("/users", userRoutes);

export default router;
