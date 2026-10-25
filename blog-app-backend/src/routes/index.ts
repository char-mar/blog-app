import { Router } from "express";

import authRoutes from "./auth.route";
import categoryRoutes from "./category.route";
import commentRoutes from "./comment.route";
import postRoutes from "./post.route";
import userRoutes from "./user.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/comments", commentRoutes);
router.use("/posts", postRoutes);
router.use("/users", userRoutes);

export default router;

