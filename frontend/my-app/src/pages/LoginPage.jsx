import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../state/useAuth.js";

export function LoginPage() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await login({ email, password });
      toast.success("Welcome back!");
      const from = location.state?.from?.pathname || "/";
      navigate(from);
    } catch (err) {
      toast.error(err.message || "Login failed");
    }
  }

  return (
    <div className="container-page py-10">
      <div className="mx-auto grid max-w-md gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Login</h1>
          <p className="text-base-content/70">Access discovery and dashboard.</p>
        </div>

        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <form className="card-body gap-4" onSubmit={onSubmit}>
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

            <button className="btn btn-primary" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>

            <p className="text-center text-sm text-base-content/70">
              No account?{" "}
              <Link className="link link-hover" to="/register">
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

