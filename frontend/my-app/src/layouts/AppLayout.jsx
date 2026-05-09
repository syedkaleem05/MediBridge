import { Outlet } from "react-router-dom";
import { Navbar } from "../components/ui/Navbar.jsx";
import { Footer } from "../components/ui/Footer.jsx";

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pb-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

