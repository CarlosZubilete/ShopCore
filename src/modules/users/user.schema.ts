/* This is a schema for the inputs from request */
import mongoose from "mongoose";
import { permission } from "node:process";
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
  roles: z.array(z.instanceof(mongoose.Types.ObjectId)).optional(),
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
  roles: z.array(z.instanceof(mongoose.Types.ObjectId)).optional(),
  permissions: z.array(z.string()).optional(),
});

// export type UserInput = z.infer<typeof CreateUserInput>;
// export type UpdateUserInput = z.infer<typeof UpdateUserInput>;
