"use client";

import { cn, getRiskColor } from "@/lib/utils";
import type { RiskLevel } from "@/types";

interface StatCardProps {
  title: string;
  titleBn?: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  risk?: RiskLevel;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatCard({
  title,
  titleBn,
  value,
  subtitle,
  icon,
  risk,
  className,
}: StatCardProps) {
  const accentColor = risk ? getRiskColor(risk) : "rgba(45, 212, 191, 0.6)";

  return (
    <div
      className={cn(
        "card p-5 relative overflow-hidden",
        className
      )}
      style={{
        borderColor: `${accentColor}25`,
      }}
    >
      {/* Glow blob */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 -translate-y-4 translate-x-4"
        style={{ background: accentColor }}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              {title}
            </div>
            {titleBn && (
              <div className="text-xs text-slate-600 font-bengali mt-0.5">{titleBn}</div>
            )}
          </div>
          {icon && (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${accentColor}15`, color: accentColor }}
            >
              {icon}
            </div>
          )}
        </div>

        <div className="text-3xl font-bold text-white tabular-nums" style={{ color: accentColor }}>
          {value}
        </div>

        {subtitle && (
          <div className="text-xs text-slate-500 mt-1.5">{subtitle}</div>
        )}
      </div>
    </div>
  );
}
