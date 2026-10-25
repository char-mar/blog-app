import { and, count, desc, eq, ne } from "drizzle-orm";

import { db } from "../config/db";
import * as schema from "../db/schema";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../errors/app-error";
import type { CreatePostDto, UpdatePostDto } from "../dto/post.dto";
import { generateSlug, slugify } from "../utils/slug";
import { getPagination, buildPagination } from "../utils/pagination";
import type { PaginatedResponseDto } from "../dto/pagination.dto";
import { deleteFileByUrl } from "../utils/file-handler";

const { posts } = schema;

type Post = typeof posts.$inferSelect;
type PostUpdate = Partial<typeof posts.$inferInsert>;

export class PostService {
  async createPost(authorId: string, dto: CreatePostDto): Promise<Post> {
    try {
      const slug =
        dto.slug !== undefined
          ? this.normalizeSlug(dto.slug)
          : generateSlug(dto.title);

      await this.ensureSlugAvailable(slug);

      const status = dto.status ?? "draft";

      const [post] = await db
        .insert(posts)
        .values({
          authorId,
          categoryId: dto.categoryId,
          title: dto.title,
          slug,
          content: dto.content,
          imageUrl: dto.imageUrl ?? null,
          status,
          publishedAt: status === "published" ? new Date() : null,
        })
        .returning();

      if (!post) {
        throw new Error("Failed to create post");
      }

      return post;
    } catch (error) {
      throw error;
    }
  }

  async getAllPosts(query: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponseDto<Post>> {
    try {
      const { page, limit, offset } = getPagination(query);

      const [totalResult] = await db
        .select({ count: count() })
        .from(posts)
        .where(eq(posts.status, "published"));

      const total = Number(totalResult?.count ?? 0);

      const data = await db
        .select()
        .from(posts)
        .where(eq(posts.status, "published"))
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset(offset);

      return {
        success: true,
        data,
        pagination: buildPagination(total, page, limit),
      };
    } catch (error) {
      throw error;
    }
  }

  async getPublishedPostBySlug(slug: string): Promise<Post> {
    const [post] = await db
      .select()
      .from(posts)
      .where(and(eq(posts.slug, slug), eq(posts.status, "published")))
      .limit(1);

    if (!post) {
      throw new NotFoundError("Published post not found");
    }

    return post;
  }

  async getPostById(id: string): Promise<Post> {
    try {
      const [post] = await db.select().from(posts).where(eq(posts.id, id));

      if (!post) {
        throw new NotFoundError("Post not found");
      }

      return post;
    } catch (error) {
      throw error;
    }
  }

  async getPublishedPostById(id: string): Promise<Post> {
    try {
      const [post] = await db
        .select()
        .from(posts)
        .where(and(eq(posts.id, id), eq(posts.status, "published")));

      if (!post) {
        throw new NotFoundError("Post not found");
      }

      return post;
    } catch (error) {
      throw error;
    }
  }

  async getMyPosts(
    authorId: string,
    query: { page?: number; limit?: number },
  ): Promise<PaginatedResponseDto<Post>> {
    try {
      const { page, limit, offset } = getPagination(query);

      const [totalResult] = await db
        .select({ count: count() })
        .from(posts)
        .where(eq(posts.authorId, authorId));

      const total = Number(totalResult?.count ?? 0);

      const data = await db
        .select()
        .from(posts)
        .where(eq(posts.authorId, authorId))
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset(offset);

      return {
        success: true,
        data,
        pagination: buildPagination(total, page, limit),
      };
    } catch (error) {
      throw error;
    }
  }

  async updatePost(
    id: string,
    authorId: string,
    role: string,
    dto: UpdatePostDto,
  ): Promise<Post> {
    try {
      const post = await this.getPostById(id);

      if (post.authorId !== authorId && role !== "admin") {
        throw new ForbiddenError("Not allowed to update this post");
      }

      const updateData: PostUpdate = {
        updatedAt: new Date(),
      };

      if (dto.title !== undefined) {
        updateData.title = dto.title;
      }

      if (dto.content !== undefined) {
        updateData.content = dto.content;
      }

      if (dto.slug !== undefined) {
        const slug = this.normalizeSlug(dto.slug);
        await this.ensureSlugAvailable(slug, id);
        updateData.slug = slug;
      }

      if (dto.categoryId !== undefined) {
        updateData.categoryId = dto.categoryId;
      }

      if (dto.status !== undefined) {
        updateData.status = dto.status;

        if (dto.status === "published") {
          updateData.publishedAt = post.publishedAt ?? new Date();
        } else {
          updateData.publishedAt = null;
        }
      }

      if (dto.imageUrl !== undefined) {
        updateData.imageUrl = dto.imageUrl;
      }

      const [updated] = await db
        .update(posts)
        .set(updateData)
        .where(eq(posts.id, id))
        .returning();

      if (!updated) {
        throw new NotFoundError("Post not found");
      }

      if (dto.imageUrl !== undefined && post.imageUrl !== updated.imageUrl) {
        await deleteFileByUrl(post.imageUrl);
      }

      return updated;
    } catch (error) {
      throw error;
    }
  }

  async deletePost(id: string, authorId: string, role: string): Promise<Post> {
    try {
      const post = await this.getPostById(id);

      if (post.authorId !== authorId && role !== "admin") {
        throw new ForbiddenError("Not allowed to delete this post");
      }

      const [deleted] = await db
        .delete(posts)
        .where(eq(posts.id, id))
        .returning();

      if (!deleted) {
        throw new NotFoundError("Post not found");
      }

      await deleteFileByUrl(deleted.imageUrl);

      return deleted;
    } catch (error) {
      throw error;
    }
  }

  private normalizeSlug(value: string): string {
    const slug = slugify(value);

    if (!slug) {
      throw new BadRequestError("A valid slug is required");
    }

    return slug;
  }

  private async ensureSlugAvailable(
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    const [existing] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(
        excludeId
          ? and(eq(posts.slug, slug), ne(posts.id, excludeId))
          : eq(posts.slug, slug),
      )
      .limit(1);

    if (existing) {
      throw new ConflictError("A post with this slug already exists");
    }
  }
}

export const postService = new PostService();
