import { apiRoute } from "../lib/apiAdapter.js";
import { connectMongo } from "../lib/mongodb.js";
import { requireAuth } from "../lib/auth.js";
import { User } from "../models/User.js";
import { CustomerLedger } from "../models/CustomerLedger.js";
import { handleError, methodNotAllowed, ok } from "../lib/response.js";

function asDate(v) {
  return new Date(v).toISOString().slice(0, 10);
}

function initials(name) {
  return String(name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

async function handler(req, res) {
  try {
    if (req.method !== "GET") return methodNotAllowed(res);
    await connectMongo();

    const { userId } = requireAuth(req);
    const owner = await User.findById(userId).lean();
    if (!owner) return res.status(404).json({ success: false, message: "User not found", data: null });
    if (owner.role !== "owner" || !owner.pharmacyId) {
      return res.status(403).json({ success: false, message: "Owner access required", data: null });
    }

    const ledgers = await CustomerLedger.find({ pharmacyId: owner.pharmacyId })
      .populate("customerId")
      .sort({ updatedAt: -1 })
      .lean();

    const customers = ledgers.map((l, idx) => {
      const customer = l.customerId || {};
      const txns = [...(l.transactions || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const recent = txns[0];
      return {
        _id: String(customer._id || `${idx}`),
        name: customer.name || "Unknown Customer",
        email: customer.email || "",
        avatar: initials(customer.name || "NA"),
        status: idx % 2 === 0 ? "Active" : "Regular",
        pendingDue: l.totalDue || 0,
        recentMedicine: recent?.medicineName || "No recent medicine",
        recentTransactionDate: recent?.createdAt ? asDate(recent.createdAt) : asDate(l.updatedAt),
        transactions: txns.map((t, i) => ({
          _id: `${String(l._id)}-${i}`,
          medicineName: t.medicineName,
          quantity: t.quantity,
          amount: t.amount,
          pendingDueAfterTxn: t.pendingDueAfterTxn,
          createdAt: asDate(t.createdAt),
        })),
      };
    });

    return ok(res, "Customer accounts", { customers });
  } catch (err) {
    return handleError(res, err);
  }
}

export default apiRoute(handler);
