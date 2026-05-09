import { http } from "./http.js";

function unwrap(res) {
  if (!res?.data?.success) {
    throw new Error(res?.data?.message || "Request failed");
  }
  return res.data.data;
}

export const ecosystemService = {
  async getCustomerDashboard() {
    const res = await http.get("/customerDashboard");
    return unwrap(res);
  },
  async getCustomerAccounts() {
    const res = await http.get("/customerAccounts");
    return unwrap(res);
  },
};
