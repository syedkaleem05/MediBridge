import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["owner", "user"], required: true },
    pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy", default: null },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } },
);

UserSchema.index({ email: 1 }, { unique: true });

export const User = mongoose.models.User || mongoose.model("User", UserSchema);

