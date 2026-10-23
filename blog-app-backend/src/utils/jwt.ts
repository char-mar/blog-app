import jwt from "jsonwebtoken";

import { env } from "../config/env";
import type { JwtPayload } from "../types/jwt";

export type { JwtPayload };

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as unknown as NonNullable<Parameters<typeof jwt.sign>[2]>);
};


export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};



