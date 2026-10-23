import type { Request } from "express";

import type { AuthRequest } from "./express-request";

export type { AuthRequest };

declare global {
  namespace Express {
    interface Request {
      user?: import("./jwt").JwtPayload;
    }
  }
}

export {};

