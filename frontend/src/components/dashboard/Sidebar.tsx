"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Sprout,
  TrendingUp,
  MessageSquareText,
  ClipboardCheck,
  BarChart3,
  Settings,
  Droplets,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "সংক্ষিপ্ত বিবরণ", labelEn: "Overview", icon: LayoutDashboard },
  { href: "/map", label: "মানচিত্র", labelEn: "Salinity Map", icon: Map },
  { href: "/forecast", label: "পূর্বাভাস", labelEn: "Forecast", icon: TrendingUp },
  { href: "/advisory", label: "পরামর্শ", labelEn: "Advisory", icon: ClipboardCheck },
  { href: "/validation", label: "মাঠ যাচাই", labelEn: "Validation", icon: CheckCircle2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar w-64 h-screen sticky top-0 flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
            <Droplets className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">SalinO-Crop</div>
            <div className="text-xs text-slate-500">লবণাক্ততা পূর্বাভাস</div>
          </div>
        </div>
      </div>

      {/* Demo Mode indicator */}
      {process.env.NEXT_PUBLIC_DEMO_MODE === "true" && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-medium">
            <AlertTriangle className="w-3 h-3" />
            ডেমো মোড
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                isActive
                  ? "bg-teal-500/15 text-teal-300 border border-teal-500/25"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-teal-400" : "")} />
              <div>
                <div className="font-medium">{item.labelEn}</div>
                <div className="text-xs opacity-60 font-bengali">{item.label}</div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-800">
        <div className="text-xs text-slate-600">
          <div>Hack for Humanity 2026</div>
          <div className="text-slate-700 mt-0.5">DIU Hustle Brigade</div>
        </div>
      </div>
    </aside>
  );
}
