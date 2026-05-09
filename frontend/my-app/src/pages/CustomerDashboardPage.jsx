import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CalendarDays, CreditCard, MapPin, Wallet } from "lucide-react";
import { ecosystemService } from "../services/ecosystemService.js";
import { NearbyMap } from "../components/maps/NearbyMap.jsx";

export function CustomerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [focusPharmacyId, setFocusPharmacyId] = useState("");

  useEffect(() => {
    let ignore = false;
    async function run() {
      setLoading(true);
      try {
        const res = await ecosystemService.getCustomerDashboard();
        if (!ignore) {
          setData(res);
          setFocusPharmacyId(res.connectedPharmacies?.[0]?._id || "");
        }
      } catch (err) {
        toast.error(err.message || "Failed to load customer dashboard");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    void run();
    return () => {
      ignore = true;
    };
  }, []);

  const summary = data?.summary || {};
  const recentMedicines = data?.recentMedicines || [];
  const connected = data?.connectedPharmacies || [];
  const dues = data?.pendingDues || [];
  const timeline = data?.timeline || [];
  const mapPharmacies = useMemo(() => data?.mapPharmacies || [], [data]);

  return (
    <div className="container-page py-8">
      <section className="relative overflow-hidden rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm md:p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-transparent" />
        <div className="relative">
          <p className="text-sm uppercase tracking-wide text-base-content/60">Customer dashboard</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">
            Welcome back, {data?.welcomeName || "Customer"}
          </h1>
          <p className="mt-2 max-w-2xl text-base-content/75">
            Track your medicine history, connected pharmacies, and pending dues in one clean workspace.
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-3 md:grid-cols-4">
        {[
          { label: "Total purchases", value: summary.totalPurchases || 0, icon: CalendarDays },
          { label: "Connected pharmacies", value: summary.connectedPharmacies || 0, icon: MapPin },
          { label: "Total spent", value: `₹${summary.totalSpent || 0}`, icon: Wallet },
          { label: "Pending due", value: `₹${summary.totalDue || 0}`, icon: CreditCard },
        ].map((s) => (
          <div key={s.label} className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/60">{s.label}</p>
                  <p className="text-2xl font-bold">{loading ? "..." : s.value}</p>
                </div>
                <span className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-700">
                  <s.icon className="h-5 w-5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="text-xl font-bold">Recent medicines</h2>
            <div className="mt-2 grid gap-3 md:grid-cols-2">
              {recentMedicines.map((m) => (
                <article key={m._id} className="rounded-2xl border border-base-300 bg-base-100 p-3">
                  <div className="flex gap-3">
                    <img
                      src={m.medicineImage || "https://placehold.co/120x120?text=Medicine"}
                      alt={m.medicineName}
                      className="h-20 w-20 rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold">{m.medicineName}</p>
                      <p className="text-sm text-base-content/70">{m.pharmacyName}</p>
                      <p className="text-xs text-base-content/60">{m.purchaseDate}</p>
                      <p className="mt-1 text-sm">Qty {m.quantity} • ₹{m.amount}</p>
                    </div>
                  </div>
                </article>
              ))}
              {!loading && !recentMedicines.length ? (
                <p className="text-sm text-base-content/70">No medicine history available yet.</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="text-xl font-bold">Pending dues</h2>
            <div className="mt-2 space-y-3">
              {dues.length ? (
                dues.map((d) => (
                  <div key={d.pharmacyId} className="rounded-xl border border-base-300 bg-base-200/50 p-3">
                    <p className="font-medium">{d.pharmacyName}</p>
                    <p className="text-sm text-rose-600">Pending Due: ₹{d.pendingDue}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-base-content/70">No pending dues. Great job staying on track.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="text-xl font-bold">Connected pharmacies</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {connected.map((p) => (
              <button
                key={p._id}
                className="rounded-2xl border border-base-300 bg-base-100 p-4 text-left transition hover:border-emerald-400"
                onClick={() => setFocusPharmacyId(p._id)}
                type="button"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{p.pharmacyName}</p>
                    <p className="text-sm text-base-content/70">{p.location}</p>
                  </div>
                  <span className={`badge ${p.status === "Open" ? "badge-success" : "badge-ghost"}`}>
                    {p.status}
                  </span>
                </div>
                <p className="mt-2 text-sm">Recent purchase: {p.recentPurchase}</p>
                <p className="text-sm text-rose-600">Pending due: ₹{p.pendingDue}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="text-xl font-bold">Medicine history</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Pharmacy</th>
                    <th>Qty</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {timeline.map((t) => (
                    <tr key={t._id}>
                      <td>{t.medicineName}</td>
                      <td>{t.pharmacyName}</td>
                      <td>{t.quantity}</td>
                      <td>₹{t.amount}</td>
                      <td>{t.purchaseDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="text-xl font-bold">Nearby & connected map</h2>
            <p className="text-sm text-base-content/70">Focus any pharmacy card to fly map marker.</p>
            <NearbyMap pharmacies={mapPharmacies} focusPharmacyId={focusPharmacyId} />
          </div>
        </div>
      </section>
    </div>
  );
}
