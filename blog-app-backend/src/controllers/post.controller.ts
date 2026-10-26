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
  /**
   * Create a new post for the authenticated user.
   */
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

        if (body.slug !== undefined) {
          dto.slug = body.slug;
        }

        if (body.status !== undefined) {
          dto.status = body.status;
        }

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

  /**
   * Retrieve a published post using its slug.
   * This endpoint is intended for public article pages.
   */
  getBySlug = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { slug } = req.params;

      if (typeof slug !== "string") {
        throw new Error("Invalid post slug");
      }

      const post = await postService.getPublishedPostBySlug(slug);

      res
        .status(200)
        .json(successResponse(post, "Post retrieved successfully"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Retrieve the public list of published posts.
   */
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

  /**
   * Retrieve all posts belonging to the authenticated user.
   * Includes drafts and published posts.
   */
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

  /**
   * Retrieve one of the authenticated user's posts for editing.
   * Draft posts are allowed, but authorization is enforced by the service.
   */
  getMyPostById = (req: Request, res: Response, next: NextFunction): void => {
    void (async () => {
      try {
        const { id } = req.params as PostIdParams;
        const authorId = req.user!.id;
        const role = req.user!.role;

        const post = await postService.getMyPostById(id, authorId, role);

        res
          .status(200)
          .json(successResponse(post, "Post retrieved successfully"));
      } catch (err) {
        next(err);
      }
    })();
  };

  /**
   * Retrieve a published post by ID.
   * This public endpoint must not expose drafts.
   */
  getById = (req: Request, res: Response, next: NextFunction): void => {
    void (async () => {
      try {
        const { id } = req.params as PostIdParams;

        const post = await postService.getPublishedPostById(id);

        res
          .status(200)
          .json(successResponse(post, "Post retrieved successfully"));
      } catch (err) {
        next(err);
      }
    })();
  };

  /**
   * Update a post owned by the authenticated user or an admin.
   */
  update = (req: Request, res: Response, next: NextFunction): void => {
    void (async () => {
      try {
        const { id } = req.params as PostIdParams;
        const body = req.body as UpdatePostBody;
        const file = req.file;

        const updateDto: UpdatePostDto = {};

        if (body.title !== undefined) {
          updateDto.title = body.title;
        }

        if (body.content !== undefined) {
          updateDto.content = body.content;
        }

        if (body.categoryId !== undefined) {
          updateDto.categoryId = body.categoryId;
        }

        if (body.slug !== undefined) {
          updateDto.slug = body.slug;
        }

        if (body.status !== undefined) {
          updateDto.status = body.status;
        }

        if (file) {
          updateDto.imageUrl = getFileUrl(file.filename);
        } else if (body.imageUrl !== undefined) {
          updateDto.imageUrl = body.imageUrl;
        }

        const authorId = req.user!.id;
        const role = req.user!.role;

        const post = await postService.updatePost(
          id,
          authorId,
          role,
          updateDto,
        );

        res
          .status(200)
          .json(successResponse(post, "Post updated successfully"));
      } catch (err) {
        next(err);
      }
    })();
  };

  /**
   * Delete a post owned by the authenticated user or an admin.
   */
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
