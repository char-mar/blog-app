import fs from "fs";

import type { NextFunction, Request, Response } from "express";
import multer from "multer";

import { AppError } from "../errors/app-error";
import { env } from "../config/env";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (req.file) {
    void fs.promises.unlink(req.file.path).catch(() => {});
  }

  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_UNEXPECTED_FILE" && err.field
        ? `Unexpected file field "${err.field}". Use "imageUrl" as the file field.`
        : err.message;

    return res.status(400).json({
      success: false,
      message,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error("Unexpected error:", err);

  return res.status(500).json({
    success: false,
    message: env.NODE_ENV === "production" ? "Internal Server Error" : err.message,
  });
};
