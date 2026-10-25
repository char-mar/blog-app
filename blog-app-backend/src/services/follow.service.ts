import { and, count, desc, eq } from "drizzle-orm";

import { db } from "../config/db";
import * as schema from "../db/schema";
import type { FollowStateDto, FollowUserDto } from "../dto/follow.dto";
import type { PaginatedResponseDto } from "../dto/pagination.dto";
import { BadRequestError, NotFoundError } from "../errors/app-error";
import { buildPagination, getPagination } from "../utils/pagination";

const { follows, profiles, users } = schema;

export class FollowService {
  async follow(
    followerId: string,
    followingId: string,
  ): Promise<FollowStateDto> {
    if (followerId === followingId) {
      throw new BadRequestError("You cannot follow yourself");
    }

    await this.ensureUserExists(followingId);

    await db
      .insert(follows)
      .values({ followerId, followingId })
      .onConflictDoNothing();

    return {
      following: true,
      followersCount: await this.countFollowers(followingId),
    };
  }

  async unfollow(
    followerId: string,
    followingId: string,
  ): Promise<FollowStateDto> {
    if (followerId === followingId) {
      throw new BadRequestError("You cannot unfollow yourself");
    }

    await this.ensureUserExists(followingId);

    await db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId),
        ),
      );

    return {
      following: false,
      followersCount: await this.countFollowers(followingId),
    };
  }

  async getFollowers(
    userId: string,
    query: { page?: number; limit?: number },
  ): Promise<PaginatedResponseDto<FollowUserDto>> {
    await this.ensureUserExists(userId);

    const { page, limit, offset } = getPagination(query);

    const [totalResult, rows] = await Promise.all([
      db
        .select({ count: count() })
        .from(follows)
        .where(eq(follows.followingId, userId)),

      db
        .select({
          id: users.id,
          name: users.name,
          avatarUrl: profiles.avatarUrl,
          followedAt: follows.createdAt,
        })
        .from(follows)
        .innerJoin(users, eq(follows.followerId, users.id))
        .leftJoin(profiles, eq(profiles.userId, users.id))
        .where(eq(follows.followingId, userId))
        .orderBy(desc(follows.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    return {
      success: true,
      data: rows,
      pagination: buildPagination(
        Number(totalResult[0]?.count ?? 0),
        page,
        limit,
      ),
    };
  }

  async getFollowing(
    userId: string,
    query: { page?: number; limit?: number },
  ): Promise<PaginatedResponseDto<FollowUserDto>> {
    await this.ensureUserExists(userId);

    const { page, limit, offset } = getPagination(query);

    const [totalResult, rows] = await Promise.all([
      db
        .select({ count: count() })
        .from(follows)
        .where(eq(follows.followerId, userId)),

      db
        .select({
          id: users.id,
          name: users.name,
          avatarUrl: profiles.avatarUrl,
          followedAt: follows.createdAt,
        })
        .from(follows)
        .innerJoin(users, eq(follows.followingId, users.id))
        .leftJoin(profiles, eq(profiles.userId, users.id))
        .where(eq(follows.followerId, userId))
        .orderBy(desc(follows.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    return {
      success: true,
      data: rows,
      pagination: buildPagination(
        Number(totalResult[0]?.count ?? 0),
        page,
        limit,
      ),
    };
  }

  private async ensureUserExists(userId: string): Promise<void> {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundError("User not found");
    }
  }

  private async countFollowers(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(follows)
      .where(eq(follows.followingId, userId));

    return Number(result?.count ?? 0);
  }
}

export const followService = new FollowService();
