import mongoose from "mongoose";
import dns from "node:dns";

let cached = global.__MEDIBRIDGE_MONGO__;
if (!cached) cached = global.__MEDIBRIDGE_MONGO__ = { conn: null, promise: null };

let dnsConfigured = global.__MEDIBRIDGE_MONGO_DNS_CONFIGURED__ || false;

export async function connectMongo() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");

  // Some Windows networks return `ECONNREFUSED` for Node's SRV DNS queries.
  // For Atlas `mongodb+srv://` URIs, forcing resolvers usually stabilizes local dev.
  if (!dnsConfigured && uri.startsWith("mongodb+srv://")) {
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
    cached.promise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 15000,
      })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

