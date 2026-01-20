import { Response } from "express";

export const setAuthCookie = (res: Response, token: string) => {
  res.cookie("access_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 1000,
  });
};

export const clearAuthCookie = (res: Response) => {
  res.clearCookie("access_token");
};
