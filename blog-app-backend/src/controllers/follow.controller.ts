import type { NextFunction, Request, Response } from "express";

import { followService } from "../services/follow.service";
import { successResponse } from "../utils/api-response";
import type {
  FollowListParams,
  FollowUserParams,
} from "../validations/follow.schema";
import type { PaginationQuery } from "../validations/pagination.schema";

export class FollowController {
  follow = (req: Request, res: Response, next: NextFunction): void => {
    void (async () => {
      try {
        const { userId } = req.params as FollowUserParams;
        const state = await followService.follow(req.user!.id, userId);
        res
          .status(200)
          .json(successResponse(state, "User followed successfully"));
      } catch (err) {
        next(err);
      }
    })();
  };

  unfollow = (req: Request, res: Response, next: NextFunction): void => {
    void (async () => {
      try {
        const { userId } = req.params as FollowUserParams;
        const state = await followService.unfollow(req.user!.id, userId);
        res
          .status(200)
          .json(successResponse(state, "User unfollowed successfully"));
      } catch (err) {
        next(err);
      }
    })();
  };

  followers = (req: Request, res: Response, next: NextFunction): void => {
    void (async () => {
      try {
        const { userId } = req.params as FollowListParams;
        const query = req.query as unknown as PaginationQuery;
        const result = await followService.getFollowers(userId, query);
        res.status(200).json(result);
      } catch (err) {
        next(err);
      }
    })();
  };

  following = (req: Request, res: Response, next: NextFunction): void => {
    void (async () => {
      try {
        const { userId } = req.params as FollowListParams;
        const query = req.query as unknown as PaginationQuery;
        const result = await followService.getFollowing(userId, query);
        res.status(200).json(result);
      } catch (err) {
        next(err);
      }
    })();
  };
}

export const followController = new FollowController();
