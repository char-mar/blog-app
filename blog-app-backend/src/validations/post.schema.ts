import { z } from "zod";

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

export const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
});

export type CreatePostBody = z.infer<typeof createPostSchema>["body"];
export type UpdatePostBody = z.infer<typeof updatePostSchema>["body"];
export type PostIdParams = z.infer<typeof postIdSchema>["params"];
export type PaginationQuery = z.infer<typeof paginationSchema>["query"];
