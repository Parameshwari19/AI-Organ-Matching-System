import {
  LayoutDashboard,
  Users,
  UserRound,
  HeartPulse,
  Search,
  BarChart3,
  Bell,
  ClipboardList,
  Settings,
  Building2,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useState } from "react";

const navigation = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Donors",
    path: "/donors",
    icon: Users,
  },
  {
    label: "Recipients",
    path: "/recipients",
    icon: UserRound,
  },
  {
    label: "Organ Inventory",
    path: "/organs",
    icon: HeartPulse,
  },
  {
    label: "Matching",
    path: "/matching",
    icon: Search,
    important: true,
  },
  {
    label: "Hospital Dashboard",
    path: "/hospital",
    icon: Building2,
  },
  {
    label: "Clinical Reviews",
    path: "/clinical-reviews",
    icon: Stethoscope,
  },
  {
    label: "Reports",
    path: "/reports",
    icon: BarChart3,
  },
  {
    label: "Notifications",
    path: "/notifications",
    icon: Bell,
  },
  {
    label: "Audit Logs",
    path: "/audit-logs",
    icon: ClipboardList,
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden lg:flex fixed left-0 top-0 z-40 h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo */}
      <div
        className={`flex h-20 items-center border-b border-slate-200 ${
          collapsed ? "justify-center" : "px-6"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-xl shadow-sm shadow-emerald-100">
            🫀
          </div>

          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                OrganMatch
              </h1>

              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Clinical Decision Support
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p
          className={`mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 ${
            collapsed ? "text-center" : ""
          }`}
        >
          {collapsed ? "•••" : "Main Menu"}
        </p>

        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `group flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                    collapsed ? "justify-center" : "gap-3"
                  } ${
                    isActive
                      ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-emerald-50/70 hover:text-emerald-700"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={19}
                      strokeWidth={isActive ? 2.3 : 2}
                      className={
                        isActive
                          ? "text-emerald-600"
                          : "text-slate-400 group-hover:text-emerald-600"
                      }
                    />

                    {!collapsed && (
                      <span className="flex-1">
                        {item.label}
                      </span>
                    )}

                    {!collapsed && item.important && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-700">
                        AI
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-5 border-t border-slate-100" />

        {/* Settings */}
        <NavLink
          to="/settings"
          title={collapsed ? "Settings" : undefined}
          className={({ isActive }) =>
            `flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all ${
              collapsed ? "justify-center" : "gap-3"
            } ${
              isActive
                ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
                : "text-slate-600 hover:bg-emerald-50/70 hover:text-emerald-700"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Settings
                size={19}
                className={
                  isActive
                    ? "text-emerald-600"
                    : "text-slate-400"
                }
              />

              {!collapsed && <span>Settings</span>}
            </>
          )}
        </NavLink>
      </nav>

      {/* Prototype environment notice */}
      {!collapsed && (
        <div className="mx-3 mb-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>

            <span className="text-xs font-semibold text-emerald-700">
              Prototype mode
            </span>
          </div>

          <p className="mt-1 text-[10px] text-emerald-600/70">
            In-memory datasets and services
          </p>
        </div>
      )}

      {/* Collapse button */}
      <div className="border-t border-slate-200 p-3">
        <button
          type="button"
          onClick={() =>
            setCollapsed((value) => !value)
          }
          className="flex w-full items-center justify-center rounded-xl p-2.5 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-700"
          aria-label={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>
    </aside>
  );
}