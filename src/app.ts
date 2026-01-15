import app from "./server";
import dotenv from "dotenv";
import routes from "./routes";
import { Response } from "express";
import "./config/database";

// Load environment variables from .env file
dotenv.config();

const PORT: string | number = process.env.PORT || 8080;

// 404 handler
app.use(function (_, res: Response) {
  res.status(404).send("Sorry, the requested resource was not found.");
});

app.use("/api/v1", routes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
