import { z } from "zod";

import { paginationQuerySchema } from "./pagination.schema";

export const createCommentSchema = z.object({
  params: z.object({
    postId: z.string().uuid(),
  }),
  body: z.object({
    body: z.string().trim().min(1).max(2000),
    parentId: z.string().uuid().optional(),
  }),
});

export const postCommentsSchema = z.object({
  params: z.object({
    postId: z.string().uuid(),
  }),
  query: paginationQuerySchema,
});

export const commentIdSchema = z.object({
  params: z.object({
    commentId: z.string().uuid(),
  }),
});

export type CreateCommentBody = z.infer<typeof createCommentSchema>["body"];
export type PostCommentParams = z.infer<typeof createCommentSchema>["params"];
export type CommentIdParams = z.infer<typeof commentIdSchema>["params"];
