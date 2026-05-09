import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../state/useAuth.js";

export function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [pharmacyName, setPharmacyName] = useState("");

  const isOwner = role === "owner";
  const canSubmit = useMemo(() => {
    if (!name || !email || !password || !role) return false;
    if (isOwner && !pharmacyName) return false;
    return true;
  }, [name, email, password, role, pharmacyName, isOwner]);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await register({ name, email, password, role, pharmacyName: isOwner ? pharmacyName : undefined });
      toast.success("Account created");
      navigate(isOwner ? "/dashboard" : "/search");
    } catch (err) {
      toast.error(err.message || "Registration failed");
    }
  }

  return (
    <div className="container-page py-10">
      <div className="mx-auto grid max-w-lg gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create account</h1>
          <p className="text-base-content/70">Choose a role to unlock the right experience.</p>
        </div>

        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <form className="card-body gap-4" onSubmit={onSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="form-control">
                <div className="label">
                  <span className="label-text">Name</span>
                </div>
                <input
                  className="input input-bordered"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Arsalan"
                  required
                />
              </label>

              <label className="form-control">
                <div className="label">
                  <span className="label-text">Role</span>
                </div>
                <select
                  className="select select-bordered"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="user">Normal user</option>
                  <option value="owner">Pharmacy owner</option>
                </select>
              </label>
            </div>

            <label className="form-control">
              <div className="label">
                <span className="label-text">Email</span>
              </div>
              <input
                className="input input-bordered"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@pharmacy.com"
                required
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text">Password</span>
              </div>
              <input
                className="input input-bordered"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            {isOwner ? (
              <label className="form-control">
                <div className="label">
                  <span className="label-text">Pharmacy name</span>
                </div>
                <input
                  className="input input-bordered"
                  value={pharmacyName}
                  onChange={(e) => setPharmacyName(e.target.value)}
                  placeholder="MediBridge Pharmacy — Lal Chowk"
                  required={isOwner}
                />
              </label>
            ) : null}

            <button className="btn btn-primary" disabled={!canSubmit || loading}>
              {loading ? "Creating..." : "Create account"}
            </button>

            <p className="text-center text-sm text-base-content/70">
              Already have an account?{" "}
              <Link className="link link-hover" to="/login">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

