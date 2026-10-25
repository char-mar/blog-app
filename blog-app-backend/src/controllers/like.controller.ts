import type { NextFunction, Request, Response } from "express";

import { likeService } from "../services/like.service";
import { successResponse } from "../utils/api-response";
import type { PostLikeParams } from "../validations/like.schema";

export class LikeController {
  like = (req: Request, res: Response, next: NextFunction): void => {
    void (async () => {
      try {
        const { postId } = req.params as PostLikeParams;
        const state = await likeService.like(req.user!.id, postId);
        res
          .status(200)
          .json(successResponse(state, "Post liked successfully"));
      } catch (err) {
        next(err);
      }
    })();
  };

  unlike = (req: Request, res: Response, next: NextFunction): void => {
    void (async () => {
      try {
        const { postId } = req.params as PostLikeParams;
        const state = await likeService.unlike(req.user!.id, postId);
        res
          .status(200)
          .json(successResponse(state, "Post unliked successfully"));
      } catch (err) {
        next(err);
      }
    })();
  };
}

export const likeController = new LikeController();
