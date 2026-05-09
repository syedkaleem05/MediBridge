import { connectMongo } from "../lib/mongodb.js";
import { requireAuth } from "../lib/auth.js";
import { User } from "../models/User.js";
import { Inventory } from "../models/Inventory.js";
import { expiryInfo } from "../lib/demo.js";
import { handleError, methodNotAllowed, ok } from "../lib/response.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") return methodNotAllowed(res);
    await connectMongo();

    const { userId } = requireAuth(req);
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found", data: null });
    if (user.role !== "owner" || !user.pharmacyId) {
      return res.status(403).json({ success: false, message: "Owner access required", data: null });
    }

    const rows = await Inventory.find({ pharmacyId: user.pharmacyId })
      .sort({ updatedAt: -1 })
      .populate("medicineId")
      .lean();

    const items = rows.map((x) => {
      const ex = expiryInfo(x.expiryDate);
      return {
        _id: x._id,
        pharmacyId: x.pharmacyId,
        quantity: x.quantity,
        price: x.price,
        expiryDate: x.expiryDate?.toISOString?.() || x.expiryDate,
        batchNumber: x.batchNumber,
        inStock: x.inStock,
        createdAt: x.createdAt,
        updatedAt: x.updatedAt,
        expiryStatus: ex.expiryStatus,
        expiryLabel: ex.expiryLabel,
        medicine: x.medicineId
          ? {
              _id: x.medicineId._id,
              barcode: x.medicineId.barcode,
              medicineName: x.medicineId.medicineName,
              manufacturer: x.medicineId.manufacturer,
              category: x.medicineId.category,
              description: x.medicineId.description,
              image: x.medicineId.image,
            }
          : null,
      };
    });

    return ok(res, "Inventory", { items });
  } catch (err) {
    return handleError(res, err);
  }
}

