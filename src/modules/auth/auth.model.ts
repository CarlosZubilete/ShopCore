import mongoose, { Schema } from "mongoose";
import { IAuth } from "./auth.types";

const AuthSchema: Schema = new Schema<IAuth>(
  {
    token: { type: String, required: true },
    revoked: { type: Boolean, default: false },
    userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    createdAt: { type: Date, default: Date.now, expires: 3600 }, // Token expires in 1 hour
  },
  {
    versionKey: false,
  },
);

export const AuthModel = mongoose.model<IAuth>("Auth", AuthSchema);
