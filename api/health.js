import { ok, methodNotAllowed } from "../lib/response.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res);
  return ok(res, "OK", { uptime: process.uptime() });
}

