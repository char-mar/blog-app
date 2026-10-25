import { Router } from "express";

import { postController } from "../controllers/post.controller";
import { validate } from "../middlewares/validate";
import { requireAuth } from "../middlewares/auth.middleware";
import { createPostSchema, updatePostSchema, postIdSchema, paginationSchema } from "../validations/post.schema";
import { upload } from "../utils/file-handler";

const router = Router();

router.get("/", validate(paginationSchema), postController.getAll);
router.get("/me", requireAuth as unknown as import("express").RequestHandler, validate(paginationSchema), postController.getMyPosts);
router.get("/:id", validate(postIdSchema), postController.getById);
router.post("/", requireAuth as unknown as import("express").RequestHandler, upload.single("imageUrl"), validate(createPostSchema), postController.create);
router.patch("/:id", requireAuth as unknown as import("express").RequestHandler, upload.single("imageUrl"), validate(updatePostSchema), postController.update);
router.delete("/:id", requireAuth as unknown as import("express").RequestHandler, validate(postIdSchema), postController.delete);

export default router;
