import { connectMongo } from "../lib/mongodb.js";
import { Medicine } from "../models/Medicine.js";
import { Inventory } from "../models/Inventory.js";
import { Pharmacy } from "../models/Pharmacy.js";
import { expiryInfo, googleMapsUrl, haversineKm } from "../lib/demo.js";
import { handleError, methodNotAllowed, ok } from "../lib/response.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") return methodNotAllowed(res);
    await connectMongo();

    const q = String(req.query?.q || "").trim();
    if (!q) return ok(res, "Search", { suggestions: [], results: [] });

    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const meds = await Medicine.find({ medicineName: rx }).limit(10).lean();
    const suggestions = meds.map((m) => m.medicineName);

    const medIds = meds.map((m) => m._id);
    if (!medIds.length) return ok(res, "Search", { suggestions: [], results: [] });

    const invRows = await Inventory.find({ medicineId: { $in: medIds } })
      .sort({ updatedAt: -1 })
      .limit(50)
      .populate("medicineId")
      .lean();

    const pharmacyIds = [...new Set(invRows.map((x) => String(x.pharmacyId)))];
    const pharmacies = await Pharmacy.find({ _id: { $in: pharmacyIds } }).lean();
    const pharmacyById = new Map(pharmacies.map((p) => [String(p._id), p]));

    const userLat = req.query?.lat ? Number(req.query.lat) : 34.0837;
    const userLng = req.query?.lng ? Number(req.query.lng) : 74.7973;

    const results = invRows
      .map((x) => {
        const pharmacy = pharmacyById.get(String(x.pharmacyId));
        if (!pharmacy) return null;
        const ex = expiryInfo(x.expiryDate);
        const distanceKm = haversineKm(userLat, userLng, pharmacy.latitude, pharmacy.longitude);

        return {
          _id: x._id,
          medicine: {
            _id: x.medicineId?._id,
            barcode: x.medicineId?.barcode,
            medicineName: x.medicineId?.medicineName,
            manufacturer: x.medicineId?.manufacturer,
            category: x.medicineId?.category,
            description: x.medicineId?.description,
            image: x.medicineId?.image,
          },
          pharmacy: {
            _id: pharmacy._id,
            pharmacyName: pharmacy.pharmacyName,
            address: pharmacy.address,
            latitude: pharmacy.latitude,
            longitude: pharmacy.longitude,
            phone: pharmacy.phone,
            openingHours: pharmacy.openingHours,
            areaLabel: pharmacy.areaLabel || "",
            googleMapsUrl: googleMapsUrl(pharmacy),
          },
          quantity: x.quantity,
          price: x.price,
          expiryDate: x.expiryDate?.toISOString?.() || x.expiryDate,
          expiryLabel: ex.expiryLabel,
          expiryStatus: ex.expiryStatus,
          openNow: true,
          distanceKm,
        };
      })
      .filter(Boolean);

    return ok(res, "Search", { suggestions, results });
  } catch (err) {
    return handleError(res, err);
  }
}

