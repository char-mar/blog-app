import { Router } from "express";

import { commentController } from "../controllers/comment.controller";
import { likeController } from "../controllers/like.controller";
import { postController } from "../controllers/post.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import {
  createCommentSchema,
  postCommentsSchema,
} from "../validations/comment.schema";
import { postLikeSchema } from "../validations/like.schema";
import {
  createPostSchema,
  updatePostSchema,
  postIdSchema,
  postSlugSchema,
  paginationSchema,
} from "../validations/post.schema";
import { upload } from "../utils/file-handler";

const router = Router();

router.get("/", validate(paginationSchema), postController.getAll);

router.get(
  "/me",
  requireAuth as unknown as import("express").RequestHandler,
  validate(paginationSchema),
  postController.getMyPosts,
);

router.get(
  "/:postId/comments",
  validate(postCommentsSchema),
  commentController.listByPost,
);

router.post(
  "/:postId/comments",
  requireAuth as unknown as import("express").RequestHandler,
  validate(createCommentSchema),
  commentController.create,
);

router.post(
  "/:postId/like",
  requireAuth as unknown as import("express").RequestHandler,
  validate(postLikeSchema),
  likeController.like,
);

router.delete(
  "/:postId/like",
  requireAuth as unknown as import("express").RequestHandler,
  validate(postLikeSchema),
  likeController.unlike,
);

router.get("/slug/:slug", validate(postSlugSchema), postController.getBySlug);

router.get("/:id", validate(postIdSchema), postController.getById);

router.post(
  "/",
  requireAuth as unknown as import("express").RequestHandler,
  upload.single("imageUrl"),
  validate(createPostSchema),
  postController.create,
);

router.patch(
  "/:id",
  requireAuth as unknown as import("express").RequestHandler,
  upload.single("imageUrl"),
  validate(updatePostSchema),
  postController.update,
);

router.delete(
  "/:id",
  requireAuth as unknown as import("express").RequestHandler,
  validate(postIdSchema),
  postController.delete,
);

export default router;
