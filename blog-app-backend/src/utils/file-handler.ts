import path from "path";
import fs from "fs";

import multer from "multer";

import { BadRequestError } from "../errors/app-error";

const uploadDir = path.resolve(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const fileFilter = (
  _req: import("express").Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowed.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new BadRequestError("Only image files are allowed"));
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

export const getFileUrl = (filename: string): string => {
  return `/uploads/${filename}`;
};

export const deleteFileByUrl = async (
  url?: string | null,
): Promise<void> => {
  if (!url || !url.startsWith("/uploads/")) {
    return;
  }

  const filename = url.slice("/uploads/".length);

  if (!filename || filename.includes("/") || filename.includes("\\")) {
    return;
  }

  await fs.promises.unlink(path.join(uploadDir, filename)).catch(() => {});
};
