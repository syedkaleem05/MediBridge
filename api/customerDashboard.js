import { apiRoute } from "../lib/apiAdapter.js";
import { connectMongo } from "../lib/mongodb.js";
import { requireAuth } from "../lib/auth.js";
import { User } from "../models/User.js";
import { Pharmacy } from "../models/Pharmacy.js";
import { PurchaseHistory } from "../models/PurchaseHistory.js";
import { CustomerLedger } from "../models/CustomerLedger.js";
import { googleMapsUrl } from "../lib/demo.js";
import { handleError, methodNotAllowed, ok } from "../lib/response.js";

function dateISO(d) {
  return new Date(d).toISOString().slice(0, 10);
}

async function handler(req, res) {
  try {
    if (req.method !== "GET") return methodNotAllowed(res);
    await connectMongo();

    const { userId } = requireAuth(req);
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found", data: null });

    const historyDocs = await PurchaseHistory.find({ userId: user._id })
      .sort({ purchaseDate: -1 })
      .limit(50)
      .lean();

    const ledgerDocs = await CustomerLedger.find({ customerId: user._id })
      .populate("pharmacyId")
      .lean();

    const pharmacyIds = [
      ...new Set([
        ...historyDocs.map((h) => String(h.pharmacyId)),
        ...ledgerDocs.map((l) => String(l.pharmacyId?._id || l.pharmacyId)),
      ]),
    ];
    const pharmacyDocs = await Pharmacy.find({ _id: { $in: pharmacyIds } }).lean();
    const pharmacyById = new Map(pharmacyDocs.map((p) => [String(p._id), p]));

    const recentMedicines = historyDocs.slice(0, 6).map((h) => {
      const pharmacy = pharmacyById.get(String(h.pharmacyId));
      return {
        _id: String(h._id),
        medicineName: h.medicineName,
        medicineImage: h.medicineImage || "",
        pharmacyName: pharmacy?.pharmacyName || "Unknown Pharmacy",
        purchaseDate: dateISO(h.purchaseDate),
        quantity: h.quantity,
        amount: h.amount,
      };
    });

    const connectedPharmacies = pharmacyDocs.map((p, idx) => {
      const latest = historyDocs.find((h) => String(h.pharmacyId) === String(p._id));
      const ledger = ledgerDocs.find((l) => String(l.pharmacyId?._id || l.pharmacyId) === String(p._id));
      return {
        _id: String(p._id),
        pharmacyName: p.pharmacyName,
        location: p.address,
        recentPurchase: latest?.medicineName || "No recent purchase",
        pendingDue: ledger?.totalDue || 0,
        status: idx % 2 === 0 ? "Open" : "Closed",
        latitude: p.latitude,
        longitude: p.longitude,
        googleMapsUrl: googleMapsUrl(p),
      };
    });

    const pendingDues = connectedPharmacies.filter((p) => p.pendingDue > 0).map((p) => ({
      pharmacyId: p._id,
      pharmacyName: p.pharmacyName,
      pendingDue: p.pendingDue,
    }));

    const timeline = historyDocs.map((h) => {
      const pharmacy = pharmacyById.get(String(h.pharmacyId));
      return {
        _id: String(h._id),
        medicineName: h.medicineName,
        pharmacyName: pharmacy?.pharmacyName || "Unknown Pharmacy",
        quantity: h.quantity,
        amount: h.amount,
        purchaseDate: dateISO(h.purchaseDate),
      };
    });

    const nearby = await Pharmacy.find({}).limit(8).lean();
    const mapById = new Map();
    for (const p of [...connectedPharmacies, ...nearby]) {
      mapById.set(String(p._id), {
        _id: String(p._id),
        pharmacyName: p.pharmacyName,
        address: p.address || p.location || "",
        latitude: p.latitude,
        longitude: p.longitude,
        googleMapsUrl: p.googleMapsUrl || googleMapsUrl(p),
      });
    }

    const totalSpent = historyDocs.reduce((sum, h) => sum + Number(h.amount || 0), 0);
    const totalDue = ledgerDocs.reduce((sum, l) => sum + Number(l.totalDue || 0), 0);

    return ok(res, "Customer dashboard", {
      welcomeName: user.name,
      summary: {
        totalPurchases: historyDocs.length,
        connectedPharmacies: connectedPharmacies.length,
        totalSpent,
        totalDue,
      },
      recentMedicines,
      connectedPharmacies,
      pendingDues,
      timeline,
      mapPharmacies: [...mapById.values()],
    });
  } catch (err) {
    return handleError(res, err);
  }
}

export default apiRoute(handler);
