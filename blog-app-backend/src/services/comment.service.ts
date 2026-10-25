import { and, asc, count, eq, inArray, isNull } from "drizzle-orm";

import { db } from "../config/db";
import * as schema from "../db/schema";
import type {
  CommentResponseDto,
  CommentThreadDto,
  CreateCommentDto,
} from "../dto/comment.dto";
import type { PaginatedResponseDto } from "../dto/pagination.dto";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../errors/app-error";
import { buildPagination, getPagination } from "../utils/pagination";
import { postService } from "./post.service";

const { comments, profiles, users } = schema;

const commentColumns = {
  id: comments.id,
  postId: comments.postId,
  parentId: comments.parentId,
  body: comments.body,
  createdAt: comments.createdAt,
  updatedAt: comments.updatedAt,
  authorId: users.id,
  authorName: users.name,
  authorAvatarUrl: profiles.avatarUrl,
};

interface CommentRow {
  id: string;
  postId: string;
  parentId: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
}

export class CommentService {
  async create(
    authorId: string,
    postId: string,
    dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    await postService.getPublishedPostById(postId);

    if (dto.parentId !== undefined) {
      const [parent] = await db
        .select({
          postId: comments.postId,
          parentId: comments.parentId,
        })
        .from(comments)
        .where(eq(comments.id, dto.parentId))
        .limit(1);

      if (!parent || parent.postId !== postId) {
        throw new NotFoundError("Parent comment not found for this post");
      }

      if (parent.parentId !== null) {
        throw new BadRequestError("Replies can only be one level deep");
      }
    }

    const [comment] = await db
      .insert(comments)
      .values({
        postId,
        authorId,
        parentId: dto.parentId ?? null,
        body: dto.body,
      })
      .returning({ id: comments.id });

    if (!comment) {
      throw new Error("Failed to create comment");
    }

    const created = await this.findById(comment.id);

    if (!created) {
      throw new Error("Failed to load created comment");
    }

    return created;
  }

  async listByPost(
    postId: string,
    query: { page?: number; limit?: number },
  ): Promise<PaginatedResponseDto<CommentThreadDto>> {
    await postService.getPublishedPostById(postId);

    const { page, limit, offset } = getPagination(query);

    const topLevelWhere = and(
      eq(comments.postId, postId),
      isNull(comments.parentId),
    );

    const [totalResult, rows] = await Promise.all([
      db.select({ count: count() }).from(comments).where(topLevelWhere),

      db
        .select(commentColumns)
        .from(comments)
        .innerJoin(users, eq(comments.authorId, users.id))
        .leftJoin(profiles, eq(profiles.userId, users.id))
        .where(topLevelWhere)
        .orderBy(asc(comments.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    const total = Number(totalResult[0]?.count ?? 0);
    const topLevel = rows.map((row) => this.toDto(row));
    const topLevelIds = topLevel.map((comment) => comment.id);

    const replyRows = topLevelIds.length
      ? await db
          .select(commentColumns)
          .from(comments)
          .innerJoin(users, eq(comments.authorId, users.id))
          .leftJoin(profiles, eq(profiles.userId, users.id))
          .where(
            and(
              eq(comments.postId, postId),
              inArray(comments.parentId, topLevelIds),
            ),
          )
          .orderBy(asc(comments.createdAt))
      : [];

    const repliesByParent = new Map<string, CommentResponseDto[]>();

    for (const row of replyRows) {
      const reply = this.toDto(row);

      if (reply.parentId === null) {
        continue;
      }

      const replies = repliesByParent.get(reply.parentId);

      if (replies) {
        replies.push(reply);
      } else {
        repliesByParent.set(reply.parentId, [reply]);
      }
    }

    return {
      success: true,
      data: topLevel.map((comment) => ({
        ...comment,
        replies: repliesByParent.get(comment.id) ?? [],
      })),
      pagination: buildPagination(total, page, limit),
    };
  }

  async delete(
    commentId: string,
    userId: string,
    role: string,
  ): Promise<CommentResponseDto> {
    const existing = await this.findById(commentId);

    if (!existing) {
      throw new NotFoundError("Comment not found");
    }

    if (existing.author.id !== userId && role !== "admin") {
      throw new ForbiddenError("Not allowed to delete this comment");
    }

    const [deleted] = await db
      .delete(comments)
      .where(eq(comments.id, commentId))
      .returning({ id: comments.id });

    if (!deleted) {
      throw new NotFoundError("Comment not found");
    }

    return existing;
  }

  private async findById(id: string): Promise<CommentResponseDto | null> {
    const [row] = await db
      .select(commentColumns)
      .from(comments)
      .innerJoin(users, eq(comments.authorId, users.id))
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .where(eq(comments.id, id))
      .limit(1);

    return row ? this.toDto(row) : null;
  }

  private toDto(row: CommentRow): CommentResponseDto {
    return {
      id: row.id,
      postId: row.postId,
      parentId: row.parentId,
      body: row.body,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      author: {
        id: row.authorId,
        name: row.authorName,
        avatarUrl: row.authorAvatarUrl,
      },
    };
  }
}

export const commentService = new CommentService();
