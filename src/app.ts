import app from "./server";
import dotenv from "dotenv";
import routes from "./routes";
// import "./config/database";

// Load environment variables from .env file
dotenv.config();

const PORT: string | number = process.env.PORT || 8080;

app.use("/api/v1", routes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
