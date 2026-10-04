"use client";

import { cn } from "@/lib/utils";
import { getRiskClass, getRiskColor, getRiskLabel } from "@/lib/utils";
import type { RiskLevel } from "@/types";

interface RiskBadgeProps {
  risk: RiskLevel;
  className?: string;
  showDot?: boolean;
}

export function RiskBadge({ risk, className, showDot = true }: RiskBadgeProps) {
  const color = getRiskColor(risk);
  return (
    <span className={cn(getRiskClass(risk), className)}>
      {showDot && (
        <span
          className="w-1.5 h-1.5 rounded-full inline-block"
          style={{ background: color }}
        />
      )}
      {getRiskLabel(risk)}
    </span>
  );
}
