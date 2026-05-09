import mongoose from "mongoose";

const PurchaseHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy", required: true },
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
    medicineName: { type: String, required: true, trim: true },
    medicineImage: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    amount: { type: Number, required: true, min: 0 },
    purchaseDate: { type: Date, required: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } },
);

PurchaseHistorySchema.index({ userId: 1, purchaseDate: -1 });
PurchaseHistorySchema.index({ pharmacyId: 1, purchaseDate: -1 });

export const PurchaseHistory =
  mongoose.models.PurchaseHistory || mongoose.model("PurchaseHistory", PurchaseHistorySchema);
