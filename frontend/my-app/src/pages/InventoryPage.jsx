import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";
import { inventoryService } from "../services/inventoryService.js";

function badgeForExpiry(status) {
  if (status === "expired") return "badge-error";
  if (status === "expiring") return "badge-info";
  return "badge-success badge-outline";
}

export function InventoryPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");

  const [edit, setEdit] = useState(null); // { _id, quantity, price, expiryDate }

  async function reload() {
    setLoading(true);
    try {
      const data = await inventoryService.getInventory();
      setItems(data.items || []);
    } catch (err) {
      toast.error(err.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void inventoryService
      .getInventory()
      .then((data) => {
        setItems(data.items || []);
      })
      .catch((err) => {
        toast.error(err.message || "Failed to load inventory");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((x) => x.medicine.medicineName.toLowerCase().includes(s));
  }, [items, q]);

  async function onDelete(item) {
    if (!confirm(`Remove ${item.medicine.medicineName} from your inventory?`)) return;
    try {
      await inventoryService.deleteMedicine({ inventoryId: item._id });
      toast.success("Removed from inventory");
      reload();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  }

  async function onSaveEdit(e) {
    e.preventDefault();
    try {
      await inventoryService.updateMedicine({
        inventoryId: edit._id,
        quantity: Number(edit.quantity),
        price: Number(edit.price),
        expiryDate: edit.expiryDate,
      });
      toast.success("Inventory updated");
      setEdit(null);
      reload();
    } catch (err) {
      toast.error(err.message || "Update failed");
    }
  }

  return (
    <div className="container-page py-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-base-content/70">Edit quantity/price/expiry. Delete removes only your inventory row.</p>
        </div>
        <div className="w-full sm:max-w-sm">
          <input
            className="input input-bordered w-full"
            placeholder="Search inventory..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-10 w-full" />
              ))}
            </div>
          ) : filtered.length ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Barcode</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Expiry</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((x) => (
                    <tr key={x._id} className={x.expiryStatus !== "safe" ? "bg-base-200/40" : ""}>
                      <td>
                        <div className="font-semibold">{x.medicine.medicineName}</div>
                        <div className="text-xs text-base-content/60">{x.medicine.manufacturer}</div>
                      </td>
                      <td className="font-mono text-xs">{x.medicine.barcode}</td>
                      <td>
                        {x.quantity < 10 ? <span className="badge badge-warning mr-2">Low</span> : null}
                        {x.quantity}
                      </td>
                      <td>₹{x.price}</td>
                      <td>{x.expiryLabel}</td>
                      <td>
                        <span className={`badge ${badgeForExpiry(x.expiryStatus)}`}>{x.expiryStatus}</span>
                      </td>
                      <td className="text-right">
                        <div className="join">
                          <button
                            className="btn btn-ghost btn-sm join-item"
                            onClick={() =>
                              setEdit({
                                _id: x._id,
                                quantity: x.quantity,
                                price: x.price,
                                expiryDate: x.expiryDate?.slice(0, 10) || "",
                              })
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button className="btn btn-ghost btn-sm join-item" onClick={() => onDelete(x)}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-base-content/70">
              Inventory empty. Go to Scan to add medicines.
            </div>
          )}
        </div>
      </div>

      <dialog className={`modal ${edit ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Edit inventory</h3>
          <form className="mt-4 grid gap-3" onSubmit={onSaveEdit}>
            <label className="form-control">
              <div className="label">
                <span className="label-text">Quantity</span>
              </div>
              <input
                className="input input-bordered"
                type="number"
                min={0}
                value={edit?.quantity ?? ""}
                onChange={(e) => setEdit((s) => ({ ...s, quantity: e.target.value }))}
                required
              />
            </label>
            <label className="form-control">
              <div className="label">
                <span className="label-text">Price (₹)</span>
              </div>
              <input
                className="input input-bordered"
                type="number"
                min={0}
                value={edit?.price ?? ""}
                onChange={(e) => setEdit((s) => ({ ...s, price: e.target.value }))}
                required
              />
            </label>
            <label className="form-control">
              <div className="label">
                <span className="label-text">Expiry date</span>
              </div>
              <input
                className="input input-bordered"
                type="date"
                value={edit?.expiryDate ?? ""}
                onChange={(e) => setEdit((s) => ({ ...s, expiryDate: e.target.value }))}
                required
              />
            </label>

            <div className="modal-action">
              <button type="button" className="btn" onClick={() => setEdit(null)}>
                Cancel
              </button>
              <button className="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setEdit(null)}>close</button>
        </form>
      </dialog>
    </div>
  );
}

