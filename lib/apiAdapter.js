/**
 * Bridges Vercel serverless (Node http.IncomingMessage / ServerResponse) with the
 * Express-like `res.status().json()` shape used by api handlers and dev/apiServer.js.
 */
function hasExpressLikeRes(res) {
  return typeof res?.status === "function" && typeof res?.json === "function";
}

function makeResLike(nativeRes) {
  return {
    status(code) {
      nativeRes.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      nativeRes.setHeader(name, value);
      return this;
    },
    json(data) {
      if (!nativeRes.getHeader("Content-Type")) {
        nativeRes.setHeader("Content-Type", "application/json; charset=utf-8");
      }
      nativeRes.end(JSON.stringify(data));
    },
    end(body) {
      nativeRes.end(body);
    },
  };
}

async function readBodyFromStream(req) {
  const method = String(req.method || "GET").toUpperCase();
  if (method === "GET" || method === "HEAD") return null;

  if (req.body != null && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (typeof req.body === "string" && req.body.length) {
    try {
      return JSON.parse(req.body);
    } catch {
      return req.body;
    }
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return null;

  const contentType = String(req.headers?.["content-type"] || "");
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return raw;
}

function parseQueryFromUrl(url, hostHeader) {
  try {
    const base = hostHeader ? `http://${hostHeader}` : "http://localhost";
    const u = new URL(String(url || "/"), base);
    const out = {};
    for (const [k, v] of u.searchParams.entries()) out[k] = v;
    return out;
  } catch {
    return {};
  }
}

export async function toAppRequest(nativeReq) {
  const method = nativeReq.method;
  const headers = nativeReq.headers || {};
  const urlQuery = parseQueryFromUrl(nativeReq.url, headers.host);
  const query = { ...urlQuery, ...(nativeReq.query && typeof nativeReq.query === "object" ? nativeReq.query : {}) };
  const body = await readBodyFromStream(nativeReq);

  return {
    method,
    headers,
    query,
    body,
    url: nativeReq.url,
  };
}

/**
 * @param {(req: object, res: object) => Promise<unknown>} handler
 */
export function apiRoute(handler) {
  return async (nativeReq, nativeRes) => {
    if (hasExpressLikeRes(nativeRes)) {
      return handler(nativeReq, nativeRes);
    }

    const reqLike = await toAppRequest(nativeReq);
    const resLike = makeResLike(nativeRes);
    return handler(reqLike, resLike);
  };
}
