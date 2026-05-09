import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, MapPin, ShieldCheck, ScanLine, Sparkles } from "lucide-react";

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent" />
        <div className="container-page py-12 md:py-16">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-3 py-1 text-sm shadow-sm">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span className="font-medium">Find medicines nearby instantly</span>
              </div>

              <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                Medicine discovery + inventory,{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  built for fast demos
                </span>
                .
              </h1>

              <p className="text-base-content/80">
                Search medicines and instantly see which pharmacies have stock — plus a clean dashboard
                for owners to manage inventory, scan barcodes, and track low stock & expiry warnings.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  className="btn btn-primary gap-2"
                  onClick={() => navigate("/search")}
                >
                  Search medicines <ArrowRight className="h-4 w-4" />
                </button>
                <Link to="/register" className="btn btn-ghost">
                  Pharmacy owner? Create account
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="card bg-base-100 shadow-sm border border-base-300">
                  <div className="card-body p-4">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                    <p className="font-semibold">Nearby availability</p>
                    <p className="text-sm text-base-content/70">Map + distance-style results.</p>
                  </div>
                </div>
                <div className="card bg-base-100 shadow-sm border border-base-300">
                  <div className="card-body p-4">
                    <ScanLine className="h-5 w-5 text-emerald-600" />
                    <p className="font-semibold">Barcode workflow</p>
                    <p className="text-sm text-base-content/70">Scan → autofill → add stock.</p>
                  </div>
                </div>
                <div className="card bg-base-100 shadow-sm border border-base-300">
                  <div className="card-body p-4">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    <p className="font-semibold">Role-based access</p>
                    <p className="text-sm text-base-content/70">Owner dashboard protected.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-3xl bg-gradient-to-tr from-emerald-500/15 to-teal-500/10 blur-2xl" />
              <div className="card relative border border-base-300 bg-base-100 shadow-xl">
                <div className="card-body">
                  <p className="text-sm font-semibold text-base-content/70">Quick search</p>
                  <div className="join w-full">
                    <input
                      className="input input-bordered join-item w-full"
                      placeholder="Try “Paracetamol”, “Crocin”…"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") navigate(`/search?q=${encodeURIComponent(e.target.value)}`);
                      }}
                    />
                    <button
                      className="btn btn-primary join-item"
                      onClick={() => navigate("/search")}
                    >
                      Search
                    </button>
                  </div>

                  <div className="divider my-2" />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-2xl border border-base-300 bg-base-200/60 p-4">
                      <div>
                        <p className="font-semibold">Crocin</p>
                        <p className="text-sm text-base-content/70">Available at 3 pharmacies</p>
                      </div>
                      <span className="badge badge-success badge-outline">In stock</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-base-300 bg-base-200/60 p-4">
                      <div>
                        <p className="font-semibold">Azithromycin</p>
                        <p className="text-sm text-base-content/70">Limited stock nearby</p>
                      </div>
                      <span className="badge badge-warning badge-outline">Low stock</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-base-300 bg-base-200/60 p-4">
                      <div>
                        <p className="font-semibold">Cetirizine</p>
                        <p className="text-sm text-base-content/70">Check expiry warnings</p>
                      </div>
                      <span className="badge badge-info badge-outline">Expiring</span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <Link to="/search" className="btn btn-outline btn-sm">
                      Explore discovery
                    </Link>
                    <Link to="/dashboard" className="btn btn-ghost btn-sm">
                      Go to dashboard
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-bold">Hackathon demo flow ready</h2>
                <p className="text-base-content/70">
                  Owner adds via barcode → user searches → pharmacies show up → map view.
                </p>
              </div>
              <Link to="/register" className="btn btn-primary">
                Start demo setup
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

