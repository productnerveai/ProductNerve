import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function MarketingLayout() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);

    // Defer to ensure the target section is mounted after route transitions.
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [location.pathname, location.hash]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
