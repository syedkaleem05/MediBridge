import "dotenv/config";
import http from "node:http";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

function makeRes(res) {
  return {
    status(code) {
      res.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      res.setHeader(name, value);
      return this;
    },
    json(data) {
      if (!res.getHeader("Content-Type")) {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
      }
      res.end(JSON.stringify(data));
    },
    end(body) {
      res.end(body);
    },
  };
}

async function readBody(req) {
  const method = (req.method || "GET").toUpperCase();
  if (method === "GET" || method === "HEAD") return null;

  const contentType = String(req.headers["content-type"] || "");
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return null;

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return raw;
}

function parseQuery(urlObj) {
  const out = {};
  for (const [k, v] of urlObj.searchParams.entries()) out[k] = v;
  return out;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiDir = path.resolve(__dirname, "..", "api");

const server = http.createServer(async (req, resNative) => {
  try {
    const urlObj = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    if (!urlObj.pathname.startsWith("/api/")) {
      return sendJson(resNative, 404, { success: false, message: "Not found", data: null });
    }

    const route = urlObj.pathname.replace(/^\/api\//, "").replace(/\/+$/, "");
    if (!route) {
      return sendJson(resNative, 404, { success: false, message: "Not found", data: null });
    }

    const filePath = path.join(apiDir, `${route}.js`);
    const handlerUrl = pathToFileURL(filePath).href + `?t=${Date.now()}`; // avoid module cache during dev

    const mod = await import(handlerUrl);
    const handler = mod.default;
    if (typeof handler !== "function") {
      return sendJson(resNative, 500, { success: false, message: "Invalid handler", data: null });
    }

    const body = await readBody(req);

    const reqLike = {
      method: req.method,
      headers: req.headers,
      query: parseQuery(urlObj),
      body,
      url: req.url,
    };
    const resLike = makeRes(resNative);

    return await handler(reqLike, resLike);
  } catch (err) {
    return sendJson(resNative, 500, { success: false, message: err?.message || "Server error", data: null });
  }
});

const port = Number(process.env.API_PORT || 3001);
server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`MediBridge API dev server running on http://localhost:${port}/api/health`);
});

