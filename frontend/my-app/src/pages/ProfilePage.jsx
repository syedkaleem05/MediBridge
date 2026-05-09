import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../state/useAuth.js";
import { authService } from "../services/authService.js";

export function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function run() {
      setLoading(true);
      try {
        const data = await authService.profile();
        if (!ignore) setUser(data.user);
      } catch (err) {
        toast.error(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    run();
    return () => {
      ignore = true;
    };
  }, [setUser]);

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-base-content/70">Account details and role access.</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={logout}>
            Logout
          </button>
        </div>

        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body">
            {loading ? (
              <div className="space-y-3">
                <div className="skeleton h-5 w-48" />
                <div className="skeleton h-5 w-72" />
                <div className="skeleton h-5 w-40" />
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-sm text-base-content/60">Name</div>
                  <div className="font-semibold">{user?.name || "-"}</div>
                </div>
                <div>
                  <div className="text-sm text-base-content/60">Email</div>
                  <div className="font-semibold">{user?.email || "-"}</div>
                </div>
                <div>
                  <div className="text-sm text-base-content/60">Role</div>
                  <div className="font-semibold capitalize">{user?.role || "-"}</div>
                </div>
                <div>
                  <div className="text-sm text-base-content/60">Pharmacy</div>
                  <div className="font-semibold">{user?.pharmacy?.pharmacyName || "-"}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="alert">
          <span className="text-sm text-base-content/70">
            Tip: Seed demo data to instantly populate pharmacies and inventory for discovery.
          </span>
        </div>
      </div>
    </div>
  );
}

