import type { NextFunction, Response } from "express";

import { UnauthorizedError } from "../errors/app-error";
import { verifyToken } from "../utils/jwt";
import type { AuthRequest } from "../types/express";

export const requireAuth = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing or invalid token");
  }

  const token = header.split(" ")[1];

  if (!token) {
    throw new UnauthorizedError("Missing or invalid token");
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
};

export const requireRole = (...roles: Array<"user" | "admin">) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError("Unauthorized");
    }
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError("Forbidden");
    }
    next();
  };
};


