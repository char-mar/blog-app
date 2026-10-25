import { z } from "zod";

export { paginationSchema } from "./pagination.schema";
export type { PaginationQuery } from "./pagination.schema";

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100),
    content: z.string().min(10),
    categoryId: z.string().uuid(),
    slug: z.string().min(3).max(255).optional(),
    status: z.enum(["draft", "published"]).optional(),
    imageUrl: z.string().url().optional(),
  }),
});

export const updatePostSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100).optional(),
    content: z.string().min(10).optional(),
    categoryId: z.string().uuid().optional(),
    slug: z.string().min(3).max(255).optional(),
    status: z.enum(["draft", "published"]).optional(),
    imageUrl: z.string().url().optional().nullable(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const postIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type CreatePostBody = z.infer<typeof createPostSchema>["body"];
export type UpdatePostBody = z.infer<typeof updatePostSchema>["body"];
export type PostIdParams = z.infer<typeof postIdSchema>["params"];
