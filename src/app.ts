import app from "./server";
import dotenv from "dotenv";
import "./config/database";

// Load environment variables from .env file
dotenv.config();

const PORT: string | number = process.env.PORT || 8080;

// 404 handler
app.use(function (_, res) {
  res
    .status(404)
    .json({ message: "Sorry, the requested resource was not found." });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
