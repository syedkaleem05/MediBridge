import { http } from "./http.js";

function unwrap(res) {
  if (!res?.data?.success) {
    const msg = res?.data?.message || "Request failed";
    throw new Error(msg);
  }
  return res.data.data;
}

export const discoveryService = {
  async searchMedicine({ q }) {
    const res = await http.get("/searchMedicine", { params: { q } });
    return unwrap(res);
  },
};

