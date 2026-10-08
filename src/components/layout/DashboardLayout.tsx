import { Outlet } from "react-router-dom";
import { useState } from "react";

import MobileSidebar from "./MobileSidebar";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7FAF8] text-slate-900">

      {/* Sidebar */}
      <Sidebar />
      <MobileSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main application area */}
      <div className="min-h-screen lg:pl-64">

        {/* Top navigation */}
        <Topbar onMenuClick={() => setMobileMenuOpen(true)} />

        {/* Page content */}
        <main className="min-h-[calc(100vh-73px)] bg-[#F7FAF8] px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>

      </div>

    </div>
  );
}
