import express, { type Request, type Response } from "express";

import cors from "cors";

export const app = express();

app.use(express.json());
app.use(cors());

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ message: "Blog app is in good health" });
});
