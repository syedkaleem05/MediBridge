import { connectMongo } from "../lib/mongodb.js";
import { Pharmacy } from "../models/Pharmacy.js";
import { googleMapsUrl } from "../lib/demo.js";
import { handleError, methodNotAllowed, ok } from "../lib/response.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") return methodNotAllowed(res);
    await connectMongo();

    const { pharmacyId } = req.query || {};
    if (!pharmacyId) return res.status(400).json({ success: false, message: "pharmacyId required", data: null });

    const p = await Pharmacy.findById(pharmacyId).lean();
    if (!p) return res.status(404).json({ success: false, message: "Pharmacy not found", data: null });
    return ok(res, "Pharmacy", { pharmacy: { ...p, googleMapsUrl: googleMapsUrl(p) } });
  } catch (err) {
    return handleError(res, err);
  }
}

