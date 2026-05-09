import mongoose from "mongoose";

const LedgerTransactionSchema = new mongoose.Schema(
  {
    medicineName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    amount: { type: Number, required: true, min: 0 },
    pendingDueAfterTxn: { type: Number, required: true, min: 0 },
    createdAt: { type: Date, required: true },
  },
  { _id: false },
);

const CustomerLedgerSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy", required: true },
    totalDue: { type: Number, default: 0, min: 0 },
    transactions: { type: [LedgerTransactionSchema], default: [] },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } },
);

CustomerLedgerSchema.index({ customerId: 1, pharmacyId: 1 }, { unique: true });
CustomerLedgerSchema.index({ pharmacyId: 1, updatedAt: -1 });

export const CustomerLedger =
  mongoose.models.CustomerLedger || mongoose.model("CustomerLedger", CustomerLedgerSchema);
