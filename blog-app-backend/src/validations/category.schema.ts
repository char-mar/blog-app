import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(3).max(100),
    slug: z.string().min(3).max(120).optional(),
    description: z.string().max(500).optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(3).max(100).optional(),
    slug: z.string().min(3).max(120).optional(),
    description: z.string().max(500).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const categoryIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const categorySlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1).max(120),
  }),
});

export const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
});

export type CreateCategoryBody = z.infer<typeof createCategorySchema>["body"];
export type UpdateCategoryBody = z.infer<typeof updateCategorySchema>["body"];
export type CategoryIdParams = z.infer<typeof categoryIdSchema>["params"];
export type CategorySlugParams = z.infer<typeof categorySlugSchema>["params"];
export type PaginationQuery = z.infer<typeof paginationSchema>["query"];
