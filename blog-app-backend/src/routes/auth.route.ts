import { Router } from "express";

import { authController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import { requireAuth } from "../middlewares/auth.middleware";
import { loginSchema, registerSchema } from "../validations/auth.schema";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", requireAuth as unknown as import("express").RequestHandler, authController.me as unknown as import("express").RequestHandler);


export default router;
