import { apiRoute } from "../lib/apiAdapter.js";
import { ok, methodNotAllowed } from "../lib/response.js";

async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res);
  return ok(res, "OK", { uptime: process.uptime() });
}

export default apiRoute(handler);
