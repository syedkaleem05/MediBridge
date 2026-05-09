import { connectMongo } from "../lib/mongodb.js";
import { requireAuth } from "../lib/auth.js";
import { User } from "../models/User.js";
import { Inventory } from "../models/Inventory.js";
import { handleError, methodNotAllowed, ok } from "../lib/response.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "DELETE") return methodNotAllowed(res);
    await connectMongo();

    const { userId } = requireAuth(req);
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found", data: null });
    if (user.role !== "owner" || !user.pharmacyId) {
      return res.status(403).json({ success: false, message: "Owner access required", data: null });
    }

    const { inventoryId } = req.body || {};
    if (!inventoryId) return res.status(400).json({ success: false, message: "inventoryId required", data: null });

    const deleted = await Inventory.findOneAndDelete({ _id: inventoryId, pharmacyId: user.pharmacyId }).lean();
    if (!deleted) return res.status(404).json({ success: false, message: "Inventory item not found", data: null });
    return ok(res, "Deleted", { inventoryId });
  } catch (err) {
    return handleError(res, err);
  }
}

