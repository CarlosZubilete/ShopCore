import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@config/env";

export const signJwt = (payload: object) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

export const verifyJwt = (token: string) =>
  jwt.verify(token, JWT_SECRET) as { sub: string };
