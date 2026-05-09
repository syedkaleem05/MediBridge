import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema(
  {
    pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy", required: true },
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
    quantity: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    expiryDate: { type: Date, required: true },
    batchNumber: { type: String, required: true, trim: true },
    inStock: { type: Boolean, default: true }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } },
);

InventorySchema.index({ pharmacyId: 1 });
InventorySchema.index({ medicineId: 1 });
InventorySchema.index({ pharmacyId: 1, medicineId: 1, batchNumber: 1 }, { unique: true });

export const Inventory =
  mongoose.models.Inventory || mongoose.model("Inventory", InventorySchema);

