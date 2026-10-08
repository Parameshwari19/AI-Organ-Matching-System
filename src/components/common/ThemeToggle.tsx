import type { ReactNode } from "react";

import {
  Monitor,
  Moon,
  Sun,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";

import type { Theme } from "../../context/ThemeContext";

export default function ThemeToggle() {
  const {
    theme,
    setTheme,
  } = useTheme();

  const options: {
    value: Theme;
    label: string;
    icon: ReactNode;
  }[] = [
    {
      value: "light",
      label: "Light",
      icon: <Sun size={16} />,
    },
    {
      value: "dark",
      label: "Dark",
      icon: <Moon size={16} />,
    },
    {
      value: "system",
      label: "System",
      icon: <Monitor size={16} />,
    },
  ];

  return (
    <div className="relative">
      <select
        value={theme}
        onChange={(event) =>
          setTheme(
            event.target.value as Theme
          )
        }
        aria-label="Select appearance"
        className="
          h-10
          appearance-none
          rounded-xl
          border
          border-slate-200
          bg-white
          px-3
          pr-9
          text-sm
          font-medium
          text-slate-700
          outline-none
          hover:bg-slate-50
          focus:border-emerald-500
          dark:border-slate-700
          dark:bg-slate-900
          dark:text-slate-200
          dark:hover:bg-slate-800
        "
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
