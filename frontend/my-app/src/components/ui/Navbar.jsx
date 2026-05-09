import { Link, NavLink, useNavigate } from "react-router-dom";
import { Pill, Search, LayoutDashboard, LogOut, User2, Info } from "lucide-react";
import { useAuth } from "../../state/useAuth.js";

function NavItem({ to, icon: Icon, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `btn btn-ghost btn-sm gap-2 ${isActive ? "bg-base-200" : ""}`
      }
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{children}</span>
    </NavLink>
  );
}

export function Navbar() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-50 border-b border-base-300 bg-base-100/70 backdrop-blur">
      <div className="container-page py-2">
        <div className="navbar p-0">
          <div className="navbar-start gap-2">
            <Link to="/" className="btn btn-ghost gap-2 text-base font-semibold">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
                <Pill className="h-5 w-5" />
              </span>
              <span>MediBridge</span>
            </Link>
          </div>

          <div className="navbar-center hidden md:flex gap-2">
            <NavItem to="/search" icon={Search}>
              Discover
            </NavItem>
            <NavItem to="/about" icon={Info}>
              About
            </NavItem>
            {user?.role === "owner" ? (
              <NavItem to="/dashboard" icon={LayoutDashboard}>
                Dashboard
              </NavItem>
            ) : null}
            {user?.role === "user" ? (
              <NavItem to="/customer-dashboard" icon={LayoutDashboard}>
                Dashboard
              </NavItem>
            ) : null}
          </div>

          <div className="navbar-end gap-2">
            {!token ? (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Create account
                </Link>
              </>
            ) : (
              <>
                <Link to="/profile" className="btn btn-ghost btn-sm gap-2">
                  <User2 className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.name || "Account"}</span>
                </Link>
                <button
                  className="btn btn-ghost btn-sm gap-2"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

