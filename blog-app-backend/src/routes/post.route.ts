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

// Public: retrieve published posts with pagination.
router.get("/", validate(paginationSchema), postController.getAll);

// Authenticated: retrieve the current user's posts.
// Register this before routes containing general ID parameters.
router.get(
  "/me",
  requireAuth as unknown as import("express").RequestHandler,
  validate(paginationSchema),
  postController.getMyPosts,
);

// Authenticated: retrieve one of the current user's posts for editing.
// Supports both drafts and published posts.
router.get(
  "/me/:id",
  requireAuth as unknown as import("express").RequestHandler,
  validate(postIdSchema),
  postController.getMyPostById,
);

// Public: retrieve comments for a post.
router.get(
  "/:postId/comments",
  validate(postCommentsSchema),
  commentController.listByPost,
);

// Authenticated: create a comment.
router.post(
  "/:postId/comments",
  requireAuth as unknown as import("express").RequestHandler,
  validate(createCommentSchema),
  commentController.create,
);

// Authenticated: like a post.
router.post(
  "/:postId/like",
  requireAuth as unknown as import("express").RequestHandler,
  validate(postLikeSchema),
  likeController.like,
);

// Authenticated: unlike a post.
router.delete(
  "/:postId/like",
  requireAuth as unknown as import("express").RequestHandler,
  validate(postLikeSchema),
  likeController.unlike,
);

// Public: retrieve a published post by its slug.
router.get("/slug/:slug", validate(postSlugSchema), postController.getBySlug);

// Public: retrieve a published post by ID.
router.get("/:id", validate(postIdSchema), postController.getById);

// Authenticated: create a post.
router.post(
  "/",
  requireAuth as unknown as import("express").RequestHandler,
  upload.single("imageUrl"),
  validate(createPostSchema),
  postController.create,
);

// Authenticated: update a post owned by the user or an admin.
router.patch(
  "/:id",
  requireAuth as unknown as import("express").RequestHandler,
  upload.single("imageUrl"),
  validate(updatePostSchema),
  postController.update,
);

// Authenticated: delete a post owned by the user or an admin.
router.delete(
  "/:id",
  requireAuth as unknown as import("express").RequestHandler,
  validate(postIdSchema),
  postController.delete,
);

export default router;
