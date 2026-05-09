import { connectMongo } from "../lib/mongodb.js";
import { requireAuth } from "../lib/auth.js";
import { User } from "../models/User.js";
import { Medicine } from "../models/Medicine.js";
import { Inventory } from "../models/Inventory.js";
import { handleError, methodNotAllowed, ok } from "../lib/response.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return methodNotAllowed(res);
    await connectMongo();

    const { userId } = requireAuth(req);
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found", data: null });
    if (user.role !== "owner" || !user.pharmacyId) {
      return res.status(403).json({ success: false, message: "Owner access required", data: null });
    }

    const { action, barcode, medicine, inventory } = req.body || {};
    if (!barcode) return res.status(400).json({ success: false, message: "barcode required", data: null });

    const bc = String(barcode).trim();

    if (action === "prefill") {
      const m = await Medicine.findOne({ barcode: bc }).lean();
      return ok(res, "Prefill", { medicine: m || null });
    }

    if (action !== "add") {
      return res.status(400).json({ success: false, message: "Invalid action", data: null });
    }

    if (!medicine?.medicineName) {
      return res.status(400).json({ success: false, message: "medicine.medicineName required", data: null });
    }
    if (!inventory?.batchNumber || !inventory?.expiryDate) {
      return res
        .status(400)
        .json({ success: false, message: "inventory.batchNumber and inventory.expiryDate required", data: null });
    }

    const qty = Number(inventory.quantity ?? 0);
    const price = Number(inventory.price ?? 0);
    if (Number.isNaN(qty) || qty < 0) return res.status(400).json({ success: false, message: "Invalid quantity", data: null });
    if (Number.isNaN(price) || price < 0) return res.status(400).json({ success: false, message: "Invalid price", data: null });

    let m = await Medicine.findOne({ barcode: bc });
    if (!m) {
      m = await Medicine.create({
        barcode: bc,
        medicineName: medicine.medicineName,
        manufacturer: medicine.manufacturer || "",
        category: medicine.category || "General",
        description: medicine.description || "",
        image: medicine.image || "",
      });
    }

    const batch = String(inventory.batchNumber).trim();
    const existingInv = await Inventory.findOne({
      pharmacyId: user.pharmacyId,
      medicineId: m._id,
      batchNumber: batch,
    }).lean();
    if (existingInv) {
      return res.status(409).json({ success: false, message: "This batch already exists in your inventory", data: null });
    }

    await Inventory.create({
      pharmacyId: user.pharmacyId,
      medicineId: m._id,
      quantity: qty,
      price,
      expiryDate: new Date(inventory.expiryDate),
      batchNumber: batch,
      inStock: qty > 0,
    });

    return ok(res, "Added", { medicineId: m._id });
  } catch (err) {
    // friendly duplicate key
    if (err?.code === 11000) {
      err.statusCode = 409;
      err.message = "Duplicate entry";
    }
    return handleError(res, err);
  }
}

