import express, { Application } from "express";
import morgan from "morgan";
import routes from "./routes";

const app: Application = express();

// Middlewares
app.use(express.json()); // Parse incoming JSON requests
app.use(morgan("dev")); // Log HTTP requests to the console

export default app;
