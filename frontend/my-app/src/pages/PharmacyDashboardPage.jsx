import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { AlertTriangle, Barcode, Boxes, CalendarClock, Plus, PackageSearch, Users } from "lucide-react";
import { inventoryService } from "../services/inventoryService.js";
import { ecosystemService } from "../services/ecosystemService.js";

export function PharmacyDashboardPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [customerAccounts, setCustomerAccounts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function run() {
      setLoading(true);
      try {
        const data = await inventoryService.getInventory();
        if (!ignore) setItems(data.items || []);
      } catch (err) {
        toast.error(err.message || "Failed to load inventory");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    run();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    async function run() {
      try {
        const data = await ecosystemService.getCustomerAccounts();
        if (!ignore) setCustomerAccounts(data.customers || []);
      } catch {
        // keep owner dashboard usable even if accounts API has no data yet
      }
    }
    void run();
    return () => {
      ignore = true;
    };
  }, []);

  const stats = useMemo(() => {
    const total = items.length;
    const lowStock = items.filter((x) => x.quantity > 0 && x.quantity < 10).length;
    const expired = items.filter((x) => x.expiryStatus === "expired").length;
    const expiring = items.filter((x) => x.expiryStatus === "expiring").length;
    return { total, lowStock, expired, expiring };
  }, [items]);

  return (
    <div className="container-page py-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Owner dashboard</h1>
          <p className="text-base-content/70">
            Monitor low stock, expiry warnings, and manage inventory.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/scan" className="btn btn-primary btn-sm gap-2">
            <Barcode className="h-4 w-4" />
            Scan medicine
          </Link>
          <Link to="/inventory" className="btn btn-outline btn-sm gap-2">
            <PackageSearch className="h-4 w-4" />
            Manage inventory
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-base-content/60">Total medicines</div>
                <div className="text-3xl font-bold">{stats.total}</div>
              </div>
              <span className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-700">
                <Boxes className="h-5 w-5" />
              </span>
            </div>
          </div>
        </div>

        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-base-content/60">Low stock</div>
                <div className="text-3xl font-bold">{stats.lowStock}</div>
              </div>
              <span className="rounded-2xl bg-amber-500/15 p-3 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </span>
            </div>
          </div>
        </div>

        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-base-content/60">Expiring soon</div>
                <div className="text-3xl font-bold">{stats.expiring}</div>
              </div>
              <span className="rounded-2xl bg-sky-500/15 p-3 text-sky-700">
                <CalendarClock className="h-5 w-5" />
              </span>
            </div>
          </div>
        </div>

        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-base-content/60">Expired</div>
                <div className="text-3xl font-bold">{stats.expired}</div>
              </div>
              <span className="rounded-2xl bg-rose-500/15 p-3 text-rose-700">
                <Plus className="h-5 w-5 rotate-45" />
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Inventory highlights</h2>
              <p className="text-sm text-base-content/70">
                Quick preview for a smooth demo. Full table in Inventory.
              </p>
            </div>
            <Link to="/inventory" className="btn btn-ghost btn-sm">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-3 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="card bg-base-200/50 border border-base-300">
                  <div className="card-body">
                    <div className="skeleton h-5 w-40" />
                    <div className="skeleton h-4 w-56" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {items.slice(0, 6).map((x) => (
                <div key={x._id} className="rounded-2xl border border-base-300 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{x.medicine.medicineName}</div>
                      <div className="text-sm text-base-content/70">
                        ₹{x.price} • Qty {x.quantity} • Expiry {x.expiryLabel}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {x.quantity < 10 ? <span className="badge badge-warning">Low</span> : null}
                      {x.expiryStatus === "expiring" ? <span className="badge badge-info">Expiring</span> : null}
                      {x.expiryStatus === "expired" ? <span className="badge badge-error">Expired</span> : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-base-content/70">
              No inventory yet. Scan a medicine to add stock.
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Customer accounts</h2>
              <p className="text-sm text-base-content/70">
                Connected customer activity, recent medicines, and pending dues.
              </p>
            </div>
            <span className="badge badge-outline gap-2">
              <Users className="h-3.5 w-3.5" />
              {customerAccounts.length} customers
            </span>
          </div>

          {customerAccounts.length ? (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {customerAccounts.map((c) => (
                <button
                  key={c._id}
                  type="button"
                  className="rounded-2xl border border-base-300 bg-base-100 p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-400"
                  onClick={() => setSelectedCustomer(c)}
                >
                  <div className="flex items-start gap-3">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 font-semibold text-emerald-700">
                      {c.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{c.name}</p>
                          <p className="text-xs text-base-content/60">{c.email}</p>
                        </div>
                        <span className="badge badge-outline">{c.status}</span>
                      </div>
                      <p className="mt-2 text-sm">Recent medicine: {c.recentMedicine}</p>
                      <div className="mt-1 flex items-center justify-between text-sm">
                        <span className="text-rose-600">Pending due: ₹{c.pendingDue}</span>
                        <span className="text-base-content/60">{c.recentTransactionDate}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-base-300 bg-base-200/40 p-4 text-sm text-base-content/70">
              No connected customers yet. Seed demo data to populate this section.
            </div>
          )}
        </div>
      </div>

      <dialog className={`modal ${selectedCustomer ? "modal-open" : ""}`}>
        <div className="modal-box max-w-2xl">
          <h3 className="text-lg font-bold">{selectedCustomer?.name || "Customer details"}</h3>
          <p className="text-sm text-base-content/70">
            Pending due: ₹{selectedCustomer?.pendingDue || 0} • Last transaction:{" "}
            {selectedCustomer?.recentTransactionDate || "-"}
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Medicine</th>
                  <th>Qty</th>
                  <th>Amount</th>
                  <th>Due after txn</th>
                </tr>
              </thead>
              <tbody>
                {(selectedCustomer?.transactions || []).map((t) => (
                  <tr key={t._id}>
                    <td>{t.createdAt}</td>
                    <td>{t.medicineName}</td>
                    <td>{t.quantity}</td>
                    <td>₹{t.amount}</td>
                    <td>₹{t.pendingDueAfterTxn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="modal-action">
            <button type="button" className="btn" onClick={() => setSelectedCustomer(null)}>
              Close
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="button" onClick={() => setSelectedCustomer(null)}>
            close
          </button>
        </form>
      </dialog>
    </div>
  );
}

