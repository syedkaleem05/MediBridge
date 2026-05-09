import { http } from "./http.js";

function unwrap(res) {
  if (!res?.data?.success) {
    const msg = res?.data?.message || "Request failed";
    throw new Error(msg);
  }
  return res.data.data;
}

export const inventoryService = {
  async getInventory() {
    const res = await http.get("/getInventory");
    return unwrap(res);
  },
  async addMedicine(payload) {
    const res = await http.post("/addMedicine", payload);
    return unwrap(res);
  },
  async updateMedicine(payload) {
    const res = await http.put("/updateMedicine", payload);
    return unwrap(res);
  },
  async deleteMedicine(payload) {
    const res = await http.delete("/deleteMedicine", { data: payload });
    return unwrap(res);
  },
};

