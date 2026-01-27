import { Response } from "express";
import { NODE_ENV } from "@config/env";

export const setAuthCookie = (res: Response, token: string) => {
  res.cookie("access_token", token, {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: "none",
    maxAge: 60 * 60 * 1000,
  });
};

export const clearAuthCookie = (res: Response) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: "none",
  });
};
