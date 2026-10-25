import type { Request, Response, NextFunction } from "express";

import { postService } from "../services/post.service";
import { successResponse } from "../utils/api-response";
import type {
  CreatePostBody,
  UpdatePostBody,
  PostIdParams,
  PaginationQuery,
} from "../validations/post.schema";
import { getFileUrl } from "../utils/file-handler";
import type { CreatePostDto, UpdatePostDto } from "../dto/post.dto";

export class PostController {
  create = (req: Request, res: Response, next: NextFunction): void => {
    void (async () => {
      try {
        const body = req.body as CreatePostBody;
        const file = req.file;
        const dto: CreatePostDto = {
          title: body.title,
          content: body.content,
          categoryId: body.categoryId,
        };
        if (body.slug !== undefined) dto.slug = body.slug;
        if (body.status !== undefined) dto.status = body.status;
        if (file) {
          dto.imageUrl = getFileUrl(file.filename);
        } else if (body.imageUrl !== undefined) {
          dto.imageUrl = body.imageUrl;
        }
        const authorId = req.user!.id;
        const post = await postService.createPost(authorId, dto);

        res
          .status(201)
          .json(successResponse(post, "Post created successfully"));
      } catch (err) {
        next(err);
      }
    })();
  };

  getAll = (req: Request, res: Response, next: NextFunction): void => {
    void (async () => {
      try {
        const query = req.query as unknown as PaginationQuery;
        const result = await postService.getAllPosts(query);
        res.status(200).json(result);
      } catch (err) {
        next(err);
      }
    })();
  };

  getMyPosts = (req: Request, res: Response, next: NextFunction): void => {
    void (async () => {
      try {
        const query = req.query as unknown as PaginationQuery;
        const authorId = req.user!.id;
        const result = await postService.getMyPosts(authorId, query);
        res.status(200).json(result);
      } catch (err) {
        next(err);
      }
    })();
  };

  getById = (req: Request, res: Response, next: NextFunction): void => {
    void (async () => {
      try {
        const { id } = req.params as PostIdParams;
        const post = await postService.getPublishedPostById(id);
        res.status(200).json(successResponse(post));
      } catch (err) {
        next(err);
      }
    })();
  };

  update = (req: Request, res: Response, next: NextFunction): void => {
    void (async () => {
      try {
        const { id } = req.params as PostIdParams;
        const body = req.body as UpdatePostBody;
        const file = req.file;
        const updatedto: UpdatePostDto = {};
        if (body.title !== undefined) updatedto.title = body.title;
        if (body.content !== undefined) updatedto.content = body.content;
        if (body.categoryId !== undefined)
          updatedto.categoryId = body.categoryId;
        if (body.slug !== undefined) updatedto.slug = body.slug;
        if (body.status !== undefined) updatedto.status = body.status;
        if (file) {
          updatedto.imageUrl = getFileUrl(file.filename);
        } else if (body.imageUrl !== undefined) {
          updatedto.imageUrl = body.imageUrl;
        }
        const authorId = req.user!.id;
        const role = req.user!.role;
        const post = await postService.updatePost(
          id,
          authorId,
          role,
          updatedto,
        );
        res
          .status(200)
          .json(successResponse(post, "Post updated successfully"));
      } catch (err) {
        next(err);
      }
    })();
  };

  delete = (req: Request, res: Response, next: NextFunction): void => {
    void (async () => {
      try {
        const { id } = req.params as PostIdParams;
        const authorId = req.user!.id;
        const role = req.user!.role;
        const post = await postService.deletePost(id, authorId, role);
        res
          .status(200)
          .json(successResponse(post, "Post deleted successfully"));
      } catch (err) {
        next(err);
      }
    })();
  };
}

export const postController = new PostController();
