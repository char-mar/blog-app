import { Router } from "express";

import { followController } from "../controllers/follow.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import {
  followListSchema,
  followUserSchema,
} from "../validations/follow.schema";

const router = Router();

router.get(
  "/:userId/followers",
  validate(followListSchema),
  followController.followers,
);
router.get(
  "/:userId/following",
  validate(followListSchema),
  followController.following,
);
router.post(
  "/:userId/follow",
  requireAuth as unknown as import("express").RequestHandler,
  validate(followUserSchema),
  followController.follow,
);
router.delete(
  "/:userId/follow",
  requireAuth as unknown as import("express").RequestHandler,
  validate(followUserSchema),
  followController.unfollow,
);

export default router;
