import mongoose from "mongoose";

const MedicineSchema = new mongoose.Schema(
  {
    barcode: { type: String, required: true, trim: true },
    medicineName: { type: String, required: true, trim: true },
    manufacturer: { type: String, default: "", trim: true },
    category: { type: String, default: "General", trim: true },
    description: { type: String, default: "", trim: true },
    image: { type: String, default: "" },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } },
);

MedicineSchema.index({ barcode: 1 }, { unique: true });
MedicineSchema.index({ medicineName: 1 });

export const Medicine = mongoose.models.Medicine || mongoose.model("Medicine", MedicineSchema);

