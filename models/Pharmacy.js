import mongoose from "mongoose";

const PharmacySchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    pharmacyName: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    phone: { type: String, default: "" },
    openingHours: { type: String, default: "9:00 AM - 9:00 PM" },
    areaLabel: { type: String, default: "" }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } },
);

PharmacySchema.index(
  { ownerId: 1 },
  { unique: true, partialFilterExpression: { ownerId: { $type: "objectId" } } },
);
PharmacySchema.index({ pharmacyName: 1 });

export const Pharmacy = mongoose.models.Pharmacy || mongoose.model("Pharmacy", PharmacySchema);

