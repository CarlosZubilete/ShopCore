// import "express-async-errors";
import app from "./server";
import { PORT } from "@config/env";
import "@config/database";

// 404 handler
app.use(function (_, res) {
  res
    .status(404)
    .json({ message: "Sorry, the requested resource was not found." });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
