/**
 * SalinO-Crop — UI Utility Helpers
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RiskLevel } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRiskClass(risk: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    low: "risk-low",
    moderate: "risk-moderate",
    high: "risk-high",
    very_high: "risk-very-high",
    unknown: "risk-unknown",
  };
  return map[risk] ?? "risk-unknown";
}

export function getRiskLabel(risk: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    low: "কম ঝুঁকি",
    moderate: "মাঝারি ঝুঁকি",
    high: "উচ্চ ঝুঁকি",
    very_high: "অত্যন্ত উচ্চ ঝুঁকি",
    unknown: "অজানা",
  };
  return map[risk] ?? "অজানা";
}

export function getRiskColor(risk: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    low: "#10b981",
    moderate: "#f59e0b",
    high: "#f97316",
    very_high: "#e11d48",
    unknown: "#6b7280",
  };
  return map[risk] ?? "#6b7280";
}

export function formatEC(ec: number | null | undefined): string {
  if (ec == null) return "—";
  return `${ec.toFixed(2)} dS/m`;
}

export function formatConfidence(conf: number | null | undefined): string {
  if (conf == null) return "—";
  return `${Math.round(conf * 100)}%`;
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function formatDateEn(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export function getModelModeLabel(mode: string): string {
  const map: Record<string, string> = {
    DEMO: "ডেমো ডেটা",
    BASELINE: "বেসলাইন মডেল",
    REAL: "লাইভ ডেটা",
    EXPERIMENTAL: "পরীক্ষামূলক",
    LSTM: "LSTM মডেল",
  };
  return map[mode] ?? mode;
}
