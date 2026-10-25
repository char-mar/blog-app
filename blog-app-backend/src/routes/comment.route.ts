import { Router } from "express";

import { commentController } from "../controllers/comment.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { commentIdSchema } from "../validations/comment.schema";

const router = Router();

router.delete(
  "/:commentId",
  requireAuth as unknown as import("express").RequestHandler,
  validate(commentIdSchema),
  commentController.delete,
);

export default router;
