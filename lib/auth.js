import jwt from "jsonwebtoken";

export function signJwt(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET");
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyJwt(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET");
  return jwt.verify(token, secret);
}

export function getBearerToken(req) {
  const h = req.headers?.authorization || req.headers?.Authorization || "";
  if (!h) return "";
  const [type, value] = String(h).split(" ");
  if (type?.toLowerCase() !== "bearer") return "";
  return value || "";
}

export function requireAuth(req) {
  const token = getBearerToken(req);
  if (!token) {
    const err = new Error("Unauthorized");
    err.statusCode = 401;
    throw err;
  }
  try {
    return verifyJwt(token);
  } catch {
    const err = new Error("Invalid token");
    err.statusCode = 401;
    throw err;
  }
}

