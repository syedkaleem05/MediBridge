const isProduction =
  process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";

export function ok(res, message, data) {
  return res.status(200).json({ success: true, message, data });
}

export function bad(res, statusCode, message, data = null) {
  return res.status(statusCode).json({ success: false, message, data });
}

export function methodNotAllowed(res) {
  return bad(res, 405, "Method not allowed");
}

export function handleError(res, err) {
  let statusCode = err?.statusCode || 500;
  let message = statusCode === 500 ? "Server error" : err?.message;

  if (err?.name === "ValidationError") {
    statusCode = 400;
    message = err.message || "Validation failed";
  } else if (err?.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err?.keyPattern || {})[0] || "field";
    message = `${field} already exists`;
  } else if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Invalid or expired token";
  } else if (err?.name === "MongooseServerSelectionError") {
    statusCode = 503;
    message = "Database connection failed";
  } else if (err?.name === "MongoServerError" && err?.message) {
    statusCode = statusCode === 500 ? 400 : statusCode;
    message = err.message;
  }

  if (isProduction) {
    // eslint-disable-next-line no-console
    console.error("[API ERROR]", err?.name, err?.message);
  } else {
    // eslint-disable-next-line no-console
    console.error("[API ERROR]", err);
  }
  return bad(res, statusCode, message);
}
