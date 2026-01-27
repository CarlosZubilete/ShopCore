import { IRole } from "./role.types";
import mongoose, { Schema } from "mongoose";

const RoleSchema: Schema = new Schema<IRole>(
  {
    name: { type: String, required: true, unique: true },
    permissions: { type: [String], default: [] },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const RoleModel = mongoose.model<IRole>("Role", RoleSchema);
