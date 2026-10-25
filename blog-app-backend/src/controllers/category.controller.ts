import type { NextFunction, Request, Response } from "express";

import type {
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../dto/category.dto";
import { categoryService } from "../services/category.service";
import { successResponse } from "../utils/api-response";
import type {
  CategoryIdParams,
  CategorySlugParams,
  CreateCategoryBody,
  PaginationQuery,
  UpdateCategoryBody,
} from "../validations/category.schema";

export class CategoryController {
  create = (req: Request, res: Response, next: NextFunction): void => {
    void (async () => {
      try {
        const body = req.body as CreateCategoryBody;
        const dto: CreateCategoryDto = { name: body.name };
        if (body.slug !== undefined) dto.slug = body.slug;
        if (body.description !== undefined) dto.description = body.description;

        const category = await categoryService.create(dto);

        res
          .status(201)
          .json(successResponse(category, "Category created successfully"));
      } catch (err) {
        next(err);
      }
    })();
  };

  getAll = (req: Request, res: Response, next: NextFunction): void => {
    void (async () => {
      try {
        const query = req.query as unknown as PaginationQuery;
        const result = await categoryService.getCategories(query);
        res.status(200).json(result);
      } catch (err) {
        next(err);
      }
    })();
  };

  getById = (req: Request, res: Response, next: NextFunction): void => {
    void (async () => {
      try {
        const { id } = req.params as CategoryIdParams;
        const category = await categoryService.getById(id);
        res.status(200).json(successResponse(category));
      } catch (err) {
        next(err);
      }
    })();
  };

  getBySlug = (req: Request, res: Response, next: NextFunction): void => {
    void (async () => {
      try {
        const { slug } = req.params as CategorySlugParams;
        const category = await categoryService.getBySlug(slug);
        res.status(200).json(successResponse(category));
      } catch (err) {
        next(err);
      }
    })();
  };

  update = (req: Request, res: Response, next: NextFunction): void => {
    void (async () => {
      try {
        const { id } = req.params as CategoryIdParams;
        const body = req.body as UpdateCategoryBody;
        const dto: UpdateCategoryDto = {};
        if (body.name !== undefined) dto.name = body.name;
        if (body.slug !== undefined) dto.slug = body.slug;
        if (body.description !== undefined) dto.description = body.description;

        const category = await categoryService.update(id, dto);

        res
          .status(200)
          .json(successResponse(category, "Category updated successfully"));
      } catch (err) {
        next(err);
      }
    })();
  };

  delete = (req: Request, res: Response, next: NextFunction): void => {
    void (async () => {
      try {
        const { id } = req.params as CategoryIdParams;
        const category = await categoryService.delete(id);
        res
          .status(200)
          .json(successResponse(category, "Category deleted successfully"));
      } catch (err) {
        next(err);
      }
    })();
  };
}

export const categoryController = new CategoryController();
