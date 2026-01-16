import express, { Application } from "express";
import morgan from "morgan";
import routes from "./routes";
import { errorMiddleware } from "./core/middlewares/error.middleware";

const app: Application = express();

// Middlewares
app.use(express.json()); // Parse incoming JSON requests
app.use(morgan("dev")); // Log HTTP requests to the console

// Routes
app.use("/api/v1", routes);

// Global error handler (must be last)
app.use(errorMiddleware);

export default app;
