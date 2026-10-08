import {
  Bell,
  Menu,
  Search,
  Sun,
  Moon,
  ChevronDown,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { getNotifications } from "../../services/notificationService";
import { useTheme } from "../../context/ThemeContext";

interface TopbarProps {
  onMenuClick?: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { resolvedTheme, setTheme } = useTheme();

  const [hasNotifications, setHasNotifications] = useState(false);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const notifications = await getNotifications();
        setHasNotifications(notifications.length > 0);
      } catch (error) {
        console.error("Failed to load notifications:", error);
        setHasNotifications(false);
      }
    }

    loadNotifications();
  }, []);

  return (
    <header className="sticky top-0 z-30 h-20 border-b border-[#174D40] bg-[#0F3D32] backdrop-blur">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Left */}
        <div className="flex items-center gap-4">

          {/* Mobile Menu */}
          <button
            type="button"
            onClick={onMenuClick}
            className="
              rounded-xl p-2.5
              text-[#527064]
              transition
              hover:bg-white/70
              hover:text-[#173A2A]
              lg:hidden
              dark:text-slate-400
              dark:hover:bg-slate-900
              dark:hover:text-white
            "
            aria-label="Open menu"
          >
            <Menu size={21} />
          </button>

          {/* Title */}
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-white">
              Transplant Coordination Center
            </p>

            <p className="text-xs text-emerald-100/70">
              Emergency Organ Matching Platform
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mx-4 hidden max-w-md flex-1 md:block">
          <div className="relative">
            <Search
              size={18}
              className="
                absolute left-3.5 top-1/2
                -translate-y-1/2
                text-[#789087]
              "
            />

            <input
              type="text"
              placeholder="Search donors, recipients, matches..."
              className="
                h-11 w-full rounded-xl
                border border-[#2B6254]
                bg-[#174D40]
                pl-11 pr-4
                text-sm text-white
                outline-none transition
                placeholder:text-emerald-100/60
                focus:border-emerald-300
                focus:ring-4
                focus:ring-emerald-900/30
              "
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            className="
              flex h-10 w-10 items-center justify-center
              rounded-xl
              border border-[#2B6254]
              text-emerald-100
              transition
              hover:bg-[#174D40]
              hover:text-white
            "
            aria-label="Toggle theme"
            title="Toggle light/dark mode"
          >
            {resolvedTheme === "dark" ? (
              <Sun size={18} />
            ) : (
              <Moon size={18} />
            )}
          </button>

          {/* Notifications */}
          <Link
            to="/notifications"
            className="
              relative flex h-10 w-10
              items-center justify-center
              rounded-xl
              border border-[#CFE3D6]
              bg-white/60
              text-[#527064]
              transition
              hover:bg-white
              hover:text-[#173A2A]
              dark:border-slate-700
              dark:bg-transparent
              dark:text-slate-400
              dark:hover:bg-slate-900
              dark:hover:text-white
            "
            aria-label="Notifications"
            title="View notifications"
          >
            <Bell size={18} />

            {hasNotifications && (
              <span
                className="
                  absolute right-2 top-2
                  h-2 w-2 rounded-full
                  bg-red-500
                  ring-2 ring-[#E8F3EC]
                  dark:ring-slate-950
                "
              />
            )}
          </Link>

          {/* Divider */}
          <div
            className="
              hidden h-8 w-px
              bg-[#CFE3D6]
              sm:block
              dark:bg-slate-800
            "
          />

          {/* User */}
          <button
            type="button"
            className="
              flex items-center gap-2
              rounded-xl p-1.5
              transition
              hover:bg-white/70
              dark:hover:bg-slate-900
            "
          >
            {/* Avatar */}
            <div
              className="
                flex h-9 w-9
                items-center justify-center
                rounded-full
                bg-[#DDF7E8]
                text-sm font-bold
                text-[#0F7A52]
              "
            >
              TC
            </div>

            {/* User Details */}
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-white">
                Coordinator
              </p>

              <p className="text-[11px] text-emerald-100/60">
                Transplant Team
              </p>
            </div>

            <ChevronDown
              size={15}
              className="
                hidden
                text-[#71867C]
                sm:block
              "
            />
          </button>
        </div>
      </div>
    </header>
  );
}