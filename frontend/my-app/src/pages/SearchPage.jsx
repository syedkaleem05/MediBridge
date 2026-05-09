import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Search, Map as MapIcon } from "lucide-react";
import { discoveryService } from "../services/discoveryService.js";
import { NearbyMap } from "../components/maps/NearbyMap.jsx";

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const initialQ = params.get("q") || "";

  const [q, setQ] = useState(initialQ);
  const dq = useDebouncedValue(q, 250);

  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState("");

  useEffect(() => {
    setParams((p) => {
      if (q) p.set("q", q);
      else p.delete("q");
      return p;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    let ignore = false;
    async function run() {
      if (!dq.trim()) {
        setSuggestions([]);
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const data = await discoveryService.searchMedicine({ q: dq });
        if (ignore) return;
        setSuggestions(data.suggestions || []);
        setResults(data.results || []);
      } catch (err) {
        toast.error(err.message || "Search failed");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    run();
    return () => {
      ignore = true;
    };
  }, [dq]);

  const pharmaciesForMap = useMemo(() => {
    const map = new globalThis.Map();
    for (const r of results) {
      map.set(r.pharmacy._id, r.pharmacy);
    }
    return [...map.values()];
  }, [results]);

  return (
    <div className="container-page py-8">
      <div className="grid gap-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Discover medicines</h1>
            <p className="text-base-content/70">
              Search by name and see nearby pharmacies with stock, price, and expiry.
            </p>
          </div>
        </div>

        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body gap-3">
            <div className="join w-full">
              <label className="join-item input input-bordered flex items-center gap-2 w-full">
                <Search className="h-4 w-4 opacity-60" />
                <input
                  className="grow"
                  placeholder="Type: Paracetamol, Crocin, Dolo..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </label>
              <button className="btn btn-primary join-item" onClick={() => setQ(q.trim())}>
                Search
              </button>
            </div>

            {suggestions.length ? (
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 8).map((s) => (
                  <button
                    key={s}
                    className="btn btn-xs btn-ghost border border-base-300"
                    onClick={() => setQ(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : null}

            {loading ? (
              <div className="grid gap-3 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="card bg-base-200/50 border border-base-300">
                    <div className="card-body">
                      <div className="skeleton h-5 w-40" />
                      <div className="skeleton h-4 w-56" />
                      <div className="skeleton h-4 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : results.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {results.map((r) => (
                  <div key={r._id} className="card border border-base-300 bg-base-100">
                    <div className="card-body gap-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold">{r.medicine.medicineName}</h3>
                          <p className="text-sm text-base-content/70">
                            {r.pharmacy.pharmacyName} • {r.pharmacy.areaLabel}
                          </p>
                        </div>
                        <span
                          className={`badge ${
                            r.quantity <= 0 ? "badge-ghost" : r.quantity < 10 ? "badge-warning" : "badge-success"
                          }`}
                        >
                          {r.quantity <= 0 ? "Out" : r.quantity < 10 ? "Low" : "In stock"}
                        </span>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-3 text-sm">
                        <div className="rounded-xl bg-base-200/50 p-3">
                          <div className="text-base-content/60">Qty</div>
                          <div className="font-semibold">{r.quantity}</div>
                        </div>
                        <div className="rounded-xl bg-base-200/50 p-3">
                          <div className="text-base-content/60">Price</div>
                          <div className="font-semibold">₹{r.price}</div>
                        </div>
                        <div className="rounded-xl bg-base-200/50 p-3">
                          <div className="text-base-content/60">Expiry</div>
                          <div className="font-semibold">{r.expiryLabel}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          className="btn btn-sm btn-outline gap-2"
                          onClick={() => setSelectedPharmacyId(r.pharmacy._id)}
                        >
                          <MapIcon className="h-4 w-4" />
                          View on map
                        </button>
                        <a
                          className="btn btn-sm btn-ghost"
                          href={r.pharmacy.googleMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open in Google Maps
                        </a>
                        <span className="text-xs text-base-content/60">
                          Distance: {r.distanceKm} km (approx)
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : dq.trim() ? (
              <div className="py-6 text-center text-base-content/70">
                No matches. Try another medicine name.
              </div>
            ) : (
              <div className="py-6 text-center text-base-content/70">
                Start typing to search medicines.
              </div>
            )}
          </div>
        </div>

        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Nearby pharmacies</h2>
                <p className="text-sm text-base-content/70">
                  Demo uses predefined Srinagar-area coordinates.
                </p>
              </div>
              <div className="text-sm text-base-content/70">
                Markers: <span className="font-semibold">{pharmaciesForMap.length}</span>
              </div>
            </div>

            <NearbyMap pharmacies={pharmaciesForMap} focusPharmacyId={selectedPharmacyId} />
          </div>
        </div>
      </div>
    </div>
  );
}

