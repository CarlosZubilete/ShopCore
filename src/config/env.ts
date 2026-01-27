import dotenv from "dotenv";

// only load .env in non-production environments
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env" });
}

// Export any environment variables you want to use elsewhere
export const PORT: number = Number(process.env.PORT);
export const MONGO_URI: string = process.env.URI_STRING!;
export const JWT_SECRET: string = process.env.JWT_SECRET!;
export const SALT_ROUNDS: number = Number(process.env.SALT_ROUNDS);
export const NODE_ENV: string = process.env.NODE_ENV!;
