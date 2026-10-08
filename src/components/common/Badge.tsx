import type { ReactNode } from "react";

type BadgeType = "success" | "warning" | "danger" | "info" | "neutral";

interface BadgeProps {
  children: ReactNode;
  type?: BadgeType;
  className?: string;
}

export default function Badge({
  children,
  type = "neutral",
  className = "",
}: BadgeProps) {
  const styles: Record<BadgeType, string> = {
    success:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    warning:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    danger: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
    info: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    neutral:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        px-2.5
        py-1
        text-xs
        font-semibold
        ${styles[type]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
