import { IUser } from "./user.types";
import mongoose, { Schema } from "mongoose";
import { SALT_ROUNDS } from "@config/env";
import bcrypt from "bcrypt";

const UserSchema: Schema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Hash password before saving
UserSchema.pre<IUser>("save", async function () {
  if (this.isModified("password") || this.isNew) {
    const hashedPassword = await bcrypt.hash(this.password, SALT_ROUNDS);
    this.password = hashedPassword;
  }
});

// Method to compare passwords
UserSchema.method(
  "comparePassword",
  async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password as string);
  }
);

// Hide password in JSON responses
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const UserModel = mongoose.model<IUser>("User", UserSchema);
