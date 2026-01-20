/* This is a schema for the inputs from request */

import { z } from "zod";

export const CreateUserInput = z.object({
  name: z
    .string()
    .trim()
    .min(5, "Name must be at least 5 characters long")
    .max(100),
  username: z
    .string()
    .trim()
    .min(5, "Username must be at least 5 characters long")
    .max(50),
  email: z.string().email("Invalid email address").max(100),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100),
});

// For updating user - all fields optional
export const UpdateUserInput = z.object({
  name: z
    .string()
    .trim()
    .min(5, "Name must be at least 5 characters long")
    .max(100)
    .optional(),
  username: z
    .string()
    .trim()
    .min(5, "Username must be at least 5 characters long")
    .max(50)
    .optional(),
  email: z.string().email("Invalid email address").max(100).optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100)
    .optional(),
});

// export type UserInput = z.infer<typeof UserInputSchema>;
// export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
