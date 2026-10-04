"use client";

import { cn } from "@/lib/utils";

interface ConfidenceBarProps {
  value: number | null; // 0–1
  className?: string;
}

export function ConfidenceBar({ value, className }: ConfidenceBarProps) {
  if (value == null) return <span className="text-slate-500 text-sm">—</span>;

  const pct = Math.round(value * 100);
  const color =
    value >= 0.75 ? "#10b981" : value >= 0.5 ? "#f59e0b" : "#e11d48";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="confidence-track flex-1">
        <div
          className="confidence-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-xs font-mono text-slate-400 w-10 text-right">
        {pct}%
      </span>
    </div>
  );
}
