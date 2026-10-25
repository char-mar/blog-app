import { and, count, eq } from "drizzle-orm";

import { db } from "../config/db";
import { likes } from "../db/schema";
import type { LikeStateDto } from "../dto/like.dto";
import { postService } from "./post.service";

export class LikeService {
  async like(userId: string, postId: string): Promise<LikeStateDto> {
    await postService.getPublishedPostById(postId);

    await db.insert(likes).values({ userId, postId }).onConflictDoNothing();

    return {
      liked: true,
      likesCount: await this.countLikes(postId),
    };
  }

  async unlike(userId: string, postId: string): Promise<LikeStateDto> {
    await postService.getPublishedPostById(postId);

    await db
      .delete(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));

    return {
      liked: false,
      likesCount: await this.countLikes(postId),
    };
  }

  private async countLikes(postId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(likes)
      .where(eq(likes.postId, postId));

    return Number(result?.count ?? 0);
  }
}

export const likeService = new LikeService();
