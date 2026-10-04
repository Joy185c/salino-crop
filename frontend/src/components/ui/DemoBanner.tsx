"use client";

import { AlertTriangle, FlaskConical } from "lucide-react";

interface DemoBannerProps {
  mode?: string;
}

export function DemoBanner({ mode = "DEMO" }: DemoBannerProps) {
  if (mode === "REAL") return null;

  return (
    <div className="demo-banner flex items-center gap-2 px-4 py-2 rounded-lg">
      <FlaskConical className="w-3.5 h-3.5 shrink-0" />
      <span>
        {mode === "DEMO"
          ? "ডেমো / নমুনা ডেটা — এটি বাস্তব উপগ্রহ পরিমাপ নয়।"
          : `মোড: ${mode} — বৈজ্ঞানিক ফলাফল সীমিত যাচাইয়ের বিষয়।`}
      </span>
    </div>
  );
}

export function WarningBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}
