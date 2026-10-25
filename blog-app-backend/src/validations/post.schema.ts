import { z } from "zod";

export { paginationSchema } from "./pagination.schema";
export type { PaginationQuery } from "./pagination.schema";

// Validate the request body when creating a post.
export const createPostSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3).max(100),
    content: z.string().min(10),
    categoryId: z.string().uuid(),
    slug: z.string().trim().min(3).max(255).optional(),
    status: z.enum(["draft", "published"]).optional(),
    imageUrl: z.string().url().optional(),
  }),
});

// Validate the request body and UUID parameter when updating a post.
export const updatePostSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3).max(100).optional(),
    content: z.string().min(10).optional(),
    categoryId: z.string().uuid().optional(),
    slug: z.string().trim().min(3).max(255).optional(),
    status: z.enum(["draft", "published"]).optional(),
    imageUrl: z.string().url().nullable().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

// Validate a post UUID.
export const postIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// Validate a post slug for public article retrieval.
export const postSlugSchema = z.object({
  params: z.object({
    slug: z.string().trim().min(3).max(255),
  }),
});

// Infer TypeScript types directly from the Zod schemas.
export type CreatePostBody = z.infer<typeof createPostSchema>["body"];

export type UpdatePostBody = z.infer<typeof updatePostSchema>["body"];

export type PostIdParams = z.infer<typeof postIdSchema>["params"];

export type PostSlugParams = z.infer<typeof postSlugSchema>["params"];
