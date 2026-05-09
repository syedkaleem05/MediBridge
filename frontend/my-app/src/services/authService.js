import { http } from "./http.js";

function unwrap(res) {
  if (!res?.data?.success) {
    const msg = res?.data?.message || "Request failed";
    throw new Error(msg);
  }
  return res.data.data;
}

function toApiError(err) {
  const status = err?.response?.status;
  const serverMessage = err?.response?.data?.message;
  const message = serverMessage || err?.message || "Request failed";
  const apiError = new Error(message);
  apiError.status = status || 500;
  return apiError;
}

export const authService = {
  async register(payload) {
    try {
      const res = await http.post("/register", payload);
      return unwrap(res);
    } catch (err) {
      throw toApiError(err);
    }
  },
  async login(payload) {
    try {
      const res = await http.post("/login", payload);
      return unwrap(res);
    } catch (err) {
      throw toApiError(err);
    }
  },
  async profile() {
    try {
      const res = await http.get("/profile");
      return unwrap(res);
    } catch (err) {
      throw toApiError(err);
    }
  },
};

