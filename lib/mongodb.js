import mongoose from "mongoose";
import dns from "node:dns";

let cached = global.__MEDIBRIDGE_MONGO__;
if (!cached) cached = global.__MEDIBRIDGE_MONGO__ = { conn: null, promise: null };

let dnsConfigured = global.__MEDIBRIDGE_MONGO_DNS_CONFIGURED__ || false;

function shouldForceCustomDns(uri) {
  if (!uri.startsWith("mongodb+srv://")) return false;
  const fromEnv = String(process.env.MONGODB_DNS_SERVERS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (fromEnv.length) return true;
  // Atlas SRV lookups are flaky on some Windows LAN setups; skip on hosted runtimes (Vercel/AWS/etc.)
  const isHosted = Boolean(process.env.VERCEL || process.env.AWS_EXECUTION_ENV);
  const isWindows = process.platform === "win32";
  return !isHosted && isWindows;
}

export async function connectMongo() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");

  if (!dnsConfigured && shouldForceCustomDns(uri)) {
    const fromEnv = String(process.env.MONGODB_DNS_SERVERS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const servers = fromEnv.length ? fromEnv : ["1.1.1.1", "8.8.8.8"];
    try {
      dns.setServers(servers);
    } catch {
      // ignore - best-effort only
    }
    dnsConfigured = true;
    global.__MEDIBRIDGE_MONGO_DNS_CONFIGURED__ = true;
  }

  if (!cached.promise) {
    const poolMax = Math.min(Number(process.env.MONGODB_MAX_POOL_SIZE) || 5, 50);
    cached.promise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_MS) || 15000,
        maxPoolSize: Number.isFinite(poolMax) && poolMax > 0 ? poolMax : 5,
      })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
