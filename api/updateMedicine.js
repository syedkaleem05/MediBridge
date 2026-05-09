import { connectMongo } from "../lib/mongodb.js";
import { requireAuth } from "../lib/auth.js";
import { User } from "../models/User.js";
import { Inventory } from "../models/Inventory.js";
import { handleError, methodNotAllowed, ok } from "../lib/response.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "PUT") return methodNotAllowed(res);
    await connectMongo();

    const { userId } = requireAuth(req);
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found", data: null });
    if (user.role !== "owner" || !user.pharmacyId) {
      return res.status(403).json({ success: false, message: "Owner access required", data: null });
    }

    const { inventoryId, quantity, price, expiryDate } = req.body || {};
    if (!inventoryId) return res.status(400).json({ success: false, message: "inventoryId required", data: null });

    const qty = Number(quantity);
    const pr = Number(price);
    if (Number.isNaN(qty) || qty < 0) return res.status(400).json({ success: false, message: "Invalid quantity", data: null });
    if (Number.isNaN(pr) || pr < 0) return res.status(400).json({ success: false, message: "Invalid price", data: null });
    if (!expiryDate) return res.status(400).json({ success: false, message: "expiryDate required", data: null });

    const updated = await Inventory.findOneAndUpdate(
      { _id: inventoryId, pharmacyId: user.pharmacyId },
      { $set: { quantity: qty, price: pr, expiryDate: new Date(expiryDate), inStock: qty > 0 } },
      { new: true },
    ).lean();

    if (!updated) return res.status(404).json({ success: false, message: "Inventory item not found", data: null });
    return ok(res, "Updated", { inventoryId: updated._id });
  } catch (err) {
    return handleError(res, err);
  }
}

