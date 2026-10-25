import { Router } from "express";

import authRoutes from "./auth.route";
import categoryRoutes from "./category.route";
import postRoutes from "./post.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/posts", postRoutes);

export default router;

