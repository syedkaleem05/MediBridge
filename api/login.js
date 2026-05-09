import bcrypt from "bcryptjs";
import { connectMongo } from "../lib/mongodb.js";
import { User } from "../models/User.js";
import { Pharmacy } from "../models/Pharmacy.js";
import { signJwt } from "../lib/auth.js";
import { googleMapsUrl } from "../lib/demo.js";
import { handleError, methodNotAllowed, ok } from "../lib/response.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return methodNotAllowed(res);
    await connectMongo();

    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Missing email/password", data: null });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials", data: null });

    const okPass = await bcrypt.compare(String(password), user.password);
    if (!okPass) return res.status(401).json({ success: false, message: "Invalid credentials", data: null });

    let pharmacy = null;
    if (user.role === "owner" && user.pharmacyId) {
      pharmacy = await Pharmacy.findById(user.pharmacyId).lean();
    }

    const token = signJwt({ userId: user._id.toString() });
    return ok(res, "Logged in", {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        pharmacyId: user.pharmacyId,
        pharmacy: pharmacy ? { ...pharmacy, googleMapsUrl: googleMapsUrl(pharmacy) } : null,
      },
    });
  } catch (err) {
    return handleError(res, err);
  }
}

