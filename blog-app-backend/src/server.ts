import { app } from "./app";

const PORT = 8000;

app.listen(PORT, () => {
  console.log("Blog app is running on http://localhost:" + PORT);
});
