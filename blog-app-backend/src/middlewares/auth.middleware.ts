import type { NextFunction, Request, Response } from "express";

import { ForbiddenError, UnauthorizedError } from "../errors/app-error";
import { verifyToken } from "../utils/jwt";

export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  // 1. Read the HTTP-only session cookie.
  const cookieValue: unknown = req.cookies?.session;

  const cookieToken = typeof cookieValue === "string" ? cookieValue : undefined;

  // 2. Support Bearer tokens for API clients.
  const header = req.get("authorization");

  const bearerToken = header?.startsWith("Bearer ")
    ? header.slice(7)
    : undefined;

  // 3. Prefer the cookie; fall back to the Bearer token.
  const token = cookieToken || bearerToken;

  if (!token) {
    next(new UnauthorizedError("Authentication required"));
    return;
  }

  // 4. Verify the token and attach the user to the request.
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token"));
  }
};

export const requireRole = (...roles: Array<"user" | "admin">) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    // Authentication must happen before role authorization.
    if (!req.user) {
      next(new UnauthorizedError("Authentication required"));
      return;
    }

    // The user is authenticated but lacks the required role.
    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError("Insufficient permissions"));
      return;
    }

    next();
  };
};
