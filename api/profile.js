import { apiRoute } from "../lib/apiAdapter.js";
import { connectMongo } from "../lib/mongodb.js";
import { requireAuth } from "../lib/auth.js";
import { User } from "../models/User.js";
import { Pharmacy } from "../models/Pharmacy.js";
import { googleMapsUrl } from "../lib/demo.js";
import { handleError, methodNotAllowed, ok } from "../lib/response.js";

async function handler(req, res) {
  try {
    if (req.method !== "GET") return methodNotAllowed(res);
    await connectMongo();

    const { userId } = requireAuth(req);
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found", data: null });

    let pharmacy = null;
    if (user.role === "owner" && user.pharmacyId) {
      pharmacy = await Pharmacy.findById(user.pharmacyId).lean();
    }

    return ok(res, "Profile", {
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

export default apiRoute(handler);
