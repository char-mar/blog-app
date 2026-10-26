import type { Request, Response, NextFunction } from "express";

import { authService } from "../services/auth.service";
import { successResponse } from "../utils/api-response";
import type { RegisterBody, LoginBody } from "../validations/auth.schema";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

export class AuthController {
  register = (req: Request, res: Response, next: NextFunction): void => {
    void (async () => {
      try {
        const body = req.body as RegisterBody;
        const result = await authService.register(body);

        res.cookie("session", result.token, cookieOptions);

        res
          .status(201)
          .json(
            successResponse(
              { user: result.user },
              "User registered successfully",
            ),
          );
      } catch (err) {
        next(err);
      }
    })();
  };

  login = (req: Request, res: Response, next: NextFunction): void => {
    void (async () => {
      try {
        const body = req.body as LoginBody;
        const result = await authService.login(body);

        res.cookie("session", result.token, cookieOptions);

        res
          .status(200)
          .json(successResponse({ user: result.user }, "Login successful"));
      } catch (err) {
        next(err);
      }
    })();
  };

  me = (req: Request, res: Response, next: NextFunction): void => {
    void (async () => {
      try {
        const userId = req.user!.id;
        const result = await authService.me(userId);

        res.status(200).json(successResponse(result));
      } catch (err) {
        next(err);
      }
    })();
  };
}

export const authController = new AuthController();
