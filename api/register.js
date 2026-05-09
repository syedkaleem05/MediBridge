import { apiRoute } from "../lib/apiAdapter.js";
import bcrypt from "bcryptjs";
import { connectMongo } from "../lib/mongodb.js";
import { User } from "../models/User.js";
import { Pharmacy } from "../models/Pharmacy.js";
import { signJwt } from "../lib/auth.js";
import { DEMO_PHARMACY_LOCATIONS, googleMapsUrl } from "../lib/demo.js";
import { handleError, methodNotAllowed, ok } from "../lib/response.js";

async function handler(req, res) {
  try {
    if (req.method !== "POST") return methodNotAllowed(res);
    await connectMongo();

    const { name, email, password, role, pharmacyName } = req.body || {};
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "Missing fields", data: null });
    }
    if (!["owner", "user"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role", data: null });
    }
    if (role === "owner" && !pharmacyName) {
      return res
        .status(400)
        .json({ success: false, message: "pharmacyName required for owners", data: null });
    }

    const existing = await User.findOne({ email: String(email).toLowerCase() }).lean();
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered", data: null });
    }

    const hashed = await bcrypt.hash(String(password), 10);
    const user = await User.create({
      name,
      email: String(email).toLowerCase(),
      password: hashed,
      role,
    });

    let pharmacy = null;
    if (role === "owner") {
      const fallback = DEMO_PHARMACY_LOCATIONS[Math.floor(Math.random() * DEMO_PHARMACY_LOCATIONS.length)];
      pharmacy = await Pharmacy.create({
        ownerId: user._id,
        pharmacyName,
        address: fallback.address,
        latitude: fallback.latitude,
        longitude: fallback.longitude,
        phone: fallback.phone,
        openingHours: fallback.openingHours,
        areaLabel: fallback.areaLabel,
      });
      user.pharmacyId = pharmacy._id;
      await user.save();
    }

    const token = signJwt({ userId: user._id.toString() });

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      pharmacyId: user.pharmacyId,
      pharmacy: pharmacy
        ? {
            ...pharmacy.toObject(),
            googleMapsUrl: googleMapsUrl(pharmacy),
          }
        : null,
    };

    return ok(res, "Registered", { token, user: safeUser });
  } catch (err) {
    return handleError(res, err);
  }
}

export default apiRoute(handler);
