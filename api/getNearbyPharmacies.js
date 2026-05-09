import { apiRoute } from "../lib/apiAdapter.js";
import { connectMongo } from "../lib/mongodb.js";
import { Pharmacy } from "../models/Pharmacy.js";
import { googleMapsUrl, haversineKm } from "../lib/demo.js";
import { handleError, methodNotAllowed, ok } from "../lib/response.js";

async function handler(req, res) {
  try {
    if (req.method !== "GET") return methodNotAllowed(res);
    await connectMongo();

    const lat = req.query?.lat ? Number(req.query.lat) : 34.0837;
    const lng = req.query?.lng ? Number(req.query.lng) : 74.7973;

    const pharmacies = await Pharmacy.find({}).limit(50).lean();
    const items = pharmacies.map((p) => ({
      ...p,
      googleMapsUrl: googleMapsUrl(p),
      distanceKm: haversineKm(lat, lng, p.latitude, p.longitude),
    }));

    return ok(res, "Nearby pharmacies", { pharmacies: items });
  } catch (err) {
    return handleError(res, err);
  }
}

export default apiRoute(handler);
