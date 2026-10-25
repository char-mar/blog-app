import { z } from "zod";

export const postLikeSchema = z.object({
  params: z.object({
    postId: z.string().uuid(),
  }),
});

export type PostLikeParams = z.infer<typeof postLikeSchema>["params"];
