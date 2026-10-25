import type { Request, Response, NextFunction } from "express";

import { authService } from "../services/auth.service";
import { successResponse } from "../utils/api-response";
import type { RegisterBody, LoginBody } from "../validations/auth.schema";

export class AuthController {
  register = (req: Request, res: Response, next: NextFunction): void => {
    void (async () => {
      try {
        const body = req.body as RegisterBody;
        const result = await authService.register(body);
        res.status(201).json(successResponse(result, "User registered successfully"));
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
        res.status(200).json(successResponse(result, "Login successful"));
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


