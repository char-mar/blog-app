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
  /**
   * Create a post for the authenticated author.
   */
  async createPost(authorId: string, dto: CreatePostDto): Promise<Post> {
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
  }

  /**
   * Return published posts for the public blog.
   */
  async getAllPosts(query: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponseDto<Post>> {
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
  }

  /**
   * Find a published post using its public URL slug.
   */
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

  /**
   * Find a post by ID, regardless of its publication status.
   *
   * Use this internally when editing or deleting posts.
   * Do not expose this method through an unrestricted public endpoint.
   */
  async getPostById(id: string): Promise<Post> {
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (!post) {
      throw new NotFoundError("Post not found");
    }

    return post;
  }

  /**
   * Find a post that its author (or an admin) is allowed to access.
   * Draft posts are allowed because this is an authenticated endpoint.
   */
  async getMyPostById(
    id: string,
    authorId: string,
    role: string,
  ): Promise<Post> {
    const post = await this.getPostById(id);

    if (post.authorId !== authorId && role !== "admin") {
      throw new ForbiddenError("Not allowed to access this post");
    }

    return post;
  }

  /**
   * Find a published post by ID for public access.
   */
  async getPublishedPostById(id: string): Promise<Post> {
    const [post] = await db
      .select()
      .from(posts)
      .where(and(eq(posts.id, id), eq(posts.status, "published")))
      .limit(1);

    if (!post) {
      throw new NotFoundError("Post not found");
    }

    return post;
  }

  /**
   * Return all posts belonging to the authenticated author.
   * Includes drafts and published posts.
   */
  async getMyPosts(
    authorId: string,
    query: { page?: number; limit?: number },
  ): Promise<PaginatedResponseDto<Post>> {
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
  }

  /**
   * Update a post if the user owns it or is an admin.
   */
  async updatePost(
    id: string,
    authorId: string,
    role: string,
    dto: UpdatePostDto,
  ): Promise<Post> {
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
        // Preserve the original publication date when editing a published post.
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

    // Delete the old image only after the database update succeeds.
    if (dto.imageUrl !== undefined && post.imageUrl !== updated.imageUrl) {
      await deleteFileByUrl(post.imageUrl);
    }

    return updated;
  }

  /**
   * Delete a post if the user owns it or is an admin.
   */
  async deletePost(id: string, authorId: string, role: string): Promise<Post> {
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
  }

  /**
   * Normalize and validate a slug before saving it.
   */
  private normalizeSlug(value: string): string {
    const slug = slugify(value);

    if (!slug) {
      throw new BadRequestError("A valid slug is required");
    }

    return slug;
  }

  /**
   * Ensure a slug is unique.
   *
   * When updating a post, exclude its own ID from the uniqueness check.
   */
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
