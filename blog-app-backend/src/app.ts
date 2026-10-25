import express from "express";
import path from "node:path";
import cors from "cors";

import routes from "./routes";
import { errorHandler } from "./middlewares/error-handler";

export const app = express();

// Parse incoming JSON requests.
app.use(express.json());

// Allow requests from your frontend.
app.use(cors());

// Serve uploaded images and other files from the uploads directory.
const uploadsDirectory = path.resolve(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsDirectory));

// Health check.
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Blog app is in good health",
  });
});

// Register API routes.
app.use("/api", routes);

// Handle application errors.
app.use(errorHandler);
