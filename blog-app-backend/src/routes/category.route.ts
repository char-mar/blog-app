import { Router } from "express";

import { categoryController } from "../controllers/category.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import {
  categoryIdSchema,
  categorySlugSchema,
  createCategorySchema,
  paginationSchema,
  updateCategorySchema,
} from "../validations/category.schema";

const router = Router();

router.get("/", validate(paginationSchema), categoryController.getAll);
router.get(
  "/slug/:slug",
  validate(categorySlugSchema),
  categoryController.getBySlug,
);
router.get("/:id", validate(categoryIdSchema), categoryController.getById);
router.post(
  "/",
  requireAuth as unknown as import("express").RequestHandler,
  validate(createCategorySchema),
  categoryController.create,
);
router.patch(
  "/:id",
  requireAuth as unknown as import("express").RequestHandler,
  validate(updateCategorySchema),
  categoryController.update,
);
router.delete(
  "/:id",
  requireAuth as unknown as import("express").RequestHandler,
  validate(categoryIdSchema),
  categoryController.delete,
);

export default router;
