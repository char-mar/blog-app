import express from "express";
import path from "path";

import cors from "cors";

import routes from "./routes";
import { errorHandler } from "./middlewares/error-handler";

export const app = express();

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Blog app is in good health" });
});

app.use("/api", routes);

app.use(errorHandler);


