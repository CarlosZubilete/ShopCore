//* PAYLOAD
import { z } from "zod";

export const LoginInput = z.object({
  email: z.string().email("Invalid email address").max(100),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100),
});
