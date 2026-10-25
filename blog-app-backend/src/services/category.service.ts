import { and, count, desc, eq, ne, or, type SQL } from "drizzle-orm";

import { db } from "../config/db";
import { categories } from "../db/schema";
import type { CreateCategoryDto, UpdateCategoryDto } from "../dto/category.dto";
import type { PaginatedResponseDto } from "../dto/pagination.dto";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../errors/app-error";
import { buildPagination, getPagination } from "../utils/pagination";
import { generateSlug, slugify } from "../utils/slug";

type Category = typeof categories.$inferSelect;
type NewCategory = typeof categories.$inferInsert;

export class CategoryService {
  async create(dto: CreateCategoryDto): Promise<Category> {
    const name = dto.name.trim();

    if (!name) {
      throw new BadRequestError("Category name cannot be empty.");
    }

    const slug =
      dto.slug !== undefined ? this.createSlug(dto.slug) : generateSlug(name);

    const [existing] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(or(eq(categories.name, name), eq(categories.slug, slug)))
      .limit(1);

    if (existing) {
      throw new ConflictError("Category name or slug already exists.");
    }

    const [category] = await db
      .insert(categories)
      .values({
        name,
        slug,
        description: dto.description?.trim() || null,
      })
      .returning();

    if (!category) {
      throw new Error("Failed to create category.");
    }

    return category;
  }

  async getCategories(query: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponseDto<Category>> {
    const { page, limit, offset } = getPagination(query);

    const [totalResult, data] = await Promise.all([
      db.select({ count: count() }).from(categories),

      db
        .select()
        .from(categories)
        .orderBy(desc(categories.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    return {
      success: true,
      data,
      pagination: buildPagination(
        Number(totalResult[0]?.count ?? 0),
        page,
        limit,
      ),
    };
  }

  async getById(id: string): Promise<Category> {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!category) {
      throw new NotFoundError(`Category with ID "${id}" not found.`);
    }

    return category;
  }

  async getBySlug(slug: string): Promise<Category> {
    const normalizedSlug = slugify(slug);

    if (!normalizedSlug) {
      throw new BadRequestError("A valid category slug is required.");
    }

    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, normalizedSlug))
      .limit(1);

    if (!category) {
      throw new NotFoundError(
        `Category with slug "${normalizedSlug}" not found.`,
      );
    }

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const existing = await this.getById(id);
    const values: Partial<NewCategory> = {};

    let name: string | undefined;
    if (dto.name !== undefined) {
      name = dto.name.trim();

      if (!name) {
        throw new BadRequestError("Category name cannot be empty.");
      }

      values.name = name;
    }

    let slug: string | undefined;
    if (dto.slug !== undefined) {
      slug = this.createSlug(dto.slug);
      values.slug = slug;
    }

    if (dto.description !== undefined) {
      values.description = dto.description.trim() || null;
    }

    if (Object.keys(values).length === 0) {
      return existing;
    }

    if (name !== undefined || slug !== undefined) {
      const conditions: SQL[] = [];
      if (name !== undefined) conditions.push(eq(categories.name, name));
      if (slug !== undefined) conditions.push(eq(categories.slug, slug));

      const [conflict] = await db
        .select({ id: categories.id })
        .from(categories)
        .where(and(ne(categories.id, id), or(...conditions)))
        .limit(1);

      if (conflict) {
        throw new ConflictError("Category name or slug already exists.");
      }
    }

    const [updatedCategory] = await db
      .update(categories)
      .set(values)
      .where(eq(categories.id, id))
      .returning();

    if (!updatedCategory) {
      throw new NotFoundError(`Category with ID "${id}" not found.`);
    }

    return updatedCategory;
  }

  async delete(id: string): Promise<Category> {
    const [deletedCategory] = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();

    if (!deletedCategory) {
      throw new NotFoundError(`Category with ID "${id}" not found.`);
    }

    return deletedCategory;
  }

  private createSlug(value: string): string {
    const slug = slugify(value);

    if (!slug) {
      throw new BadRequestError("A valid category slug is required.");
    }

    return slug;
  }
}

export const categoryService = new CategoryService();
