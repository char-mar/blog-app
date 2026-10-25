import type { NextFunction, Request, Response } from "express";

import type { CreateCommentDto } from "../dto/comment.dto";
import { commentService } from "../services/comment.service";
import { successResponse } from "../utils/api-response";
import type {
  CommentIdParams,
  CreateCommentBody,
  PostCommentParams,
} from "../validations/comment.schema";
import type { PaginationQuery } from "../validations/pagination.schema";

export class CommentController {
  create = (req: Request, res: Response, next: NextFunction): void => {
    void (async () => {
      try {
        const { postId } = req.params as PostCommentParams;
        const body = req.body as CreateCommentBody;
        const dto: CreateCommentDto = { body: body.body };
        if (body.parentId !== undefined) dto.parentId = body.parentId;

        const comment = await commentService.create(req.user!.id, postId, dto);

        res
          .status(201)
          .json(successResponse(comment, "Comment created successfully"));
      } catch (err) {
        next(err);
      }
    })();
  };

  listByPost = (req: Request, res: Response, next: NextFunction): void => {
    void (async () => {
      try {
        const { postId } = req.params as PostCommentParams;
        const query = req.query as unknown as PaginationQuery;
        const result = await commentService.listByPost(postId, query);
        res.status(200).json(result);
      } catch (err) {
        next(err);
      }
    })();
  };

  delete = (req: Request, res: Response, next: NextFunction): void => {
    void (async () => {
      try {
        const { commentId } = req.params as CommentIdParams;
        const comment = await commentService.delete(
          commentId,
          req.user!.id,
          req.user!.role,
        );
        res
          .status(200)
          .json(successResponse(comment, "Comment deleted successfully"));
      } catch (err) {
        next(err);
      }
    })();
  };
}

export const commentController = new CommentController();
