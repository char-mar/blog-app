import { z } from "zod";

import { paginationQuerySchema } from "./pagination.schema";

export const followUserSchema = z.object({
  params: z.object({
    userId: z.string().uuid(),
  }),
});

export const followListSchema = z.object({
  params: z.object({
    userId: z.string().uuid(),
  }),
  query: paginationQuerySchema,
});

export type FollowUserParams = z.infer<typeof followUserSchema>["params"];
export type FollowListParams = z.infer<typeof followListSchema>["params"];
