import { IUser } from "./user.types";
import mongoose, { Schema } from "mongoose";
import { comparePassword, hashPassword } from "@core/utils/hash";

const UserSchema: Schema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, trim: true },
    permissions: { type: [String], default: [] },
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Hash password before saving
UserSchema.pre<IUser>("save", async function () {
  if (this.isModified("password") || this.isNew) {
    const hashedPassword = await hashPassword(this.password);
    this.password = hashedPassword;
  }
});

// Method to compare passwords
UserSchema.method(
  "comparePassword",
  async function (password: string): Promise<boolean> {
    return comparePassword(password, this.password as string);
  },
);

// Hide password in JSON responses
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const UserModel = mongoose.model<IUser>("User", UserSchema);
