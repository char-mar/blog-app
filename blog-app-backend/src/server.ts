import express, { type Request, type Response } from "express";

import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

const PORT = 8000;

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ message: "Blog app is in good health" });
});

app.listen(PORT, () => {
  console.log("Blog app is running on http://localhost:" + PORT);
});
