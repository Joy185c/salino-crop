"use client";

import { useEffect, useState } from "react";
import {
  Sprout,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Droplets,
  TrendingUp,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { StatCard } from "@/components/dashboard/StatCard";
import { DemoBanner } from "@/components/ui/DemoBanner";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { getPlots, getHealth, getMeasurements } from "@/lib/api";
import type { HealthData, Plot, GroundMeasurement } from "@/types";
import { formatDateEn } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [measurements, setMeasurements] = useState<GroundMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  useEffect(() => {
    async function load() {
      try {
        const [h, p, m] = await Promise.all([
          getHealth(),
          getPlots({ demo_only: isDemo, limit: 50 }),
          getMeasurements(),
        ]);
        setHealth(h);
        setPlots(p);
        setMeasurements(m);
      } catch (e: any) {
        setError(e.message ?? "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const demoPlots = plots.filter((p) => p.is_demo);
  const totalPlots = plots.length;
  const pendingMeasurements = measurements.filter((m) => !m.quality_reviewed).length;

  return (
    <div className="flex min-h-screen">
      
      <main className="flex-1 p-6 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">ড্যাশবোর্ড</h1>
            <p className="text-slate-400 text-sm mt-1">
              SalinO-Crop — উপকূলীয় কৃষি লবণাক্ততা পর্যবেক্ষণ প্ল্যাটফর্ম
            </p>
          </div>
          <div className="flex items-center gap-2">
            {health && (
              <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${
                health.status === "ok"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/30"
              }`}>
                <Activity className="w-3 h-3" />
                API {health.status === "ok" ? "Online" : "Degraded"}
              </div>
            )}
          </div>
        </div>

        {/* Demo Banner */}
        {isDemo && (
          <div className="demo-banner px-4 py-2.5 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="font-bengali">
              ডেমো মোড চলছে — সব ডেটা নমুনা। বাস্তব স্যাটেলাইট ডেটার জন্য DEMO_MODE=false করুন।
            </span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <div className="font-medium">ব্যাকএন্ড সংযোগ ব্যর্থ</div>
              <div className="text-sm opacity-80 mt-1">{error}</div>
              <div className="text-xs text-rose-400 mt-2">
                নিশ্চিত করুন FastAPI চলছে: uvicorn app.main:app --reload
              </div>
            </div>
          </div>
        )}

        {/* Stats grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              title="Monitored Plots"
              titleBn="পর্যবেক্ষিত জমি"
              value={totalPlots}
              icon={<MapPin className="w-4 h-4" />}
              subtitle={`${demoPlots.length} demo plots`}
            />
            <StatCard
              title="Pending Validations"
              titleBn="অপেক্ষমাণ যাচাই"
              value={pendingMeasurements}
              icon={<CheckCircle2 className="w-4 h-4" />}
              risk={pendingMeasurements > 5 ? "moderate" : "low"}
              subtitle="Field EC readings not yet reviewed"
            />
            <StatCard
              title="Salinity Model"
              titleBn="লবণাক্ততা মডেল"
              value="RF v1"
              icon={<Activity className="w-4 h-4" />}
              subtitle={`Mode: ${health?.components?.salinity_model || "baseline"}`}
            />
            <StatCard
              title="Forecast Model"
              titleBn="পূর্বাভাস মডেল"
              value="Baseline"
              icon={<TrendingUp className="w-4 h-4" />}
              subtitle="30/60/90 day EC projection"
            />
          </div>
        )}

        {/* Plots table */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white">পর্যবেক্ষণাধীন জমি</h2>
              <p className="text-xs text-slate-500 mt-0.5">Monitored Agricultural Plots</p>
            </div>
            <Link
              href="/map"
              className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1"
            >
              মানচিত্র দেখুন →
            </Link>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-12 rounded-lg" />
              ))}
            </div>
          ) : plots.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <Sprout className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <div>কোনো জমি পাওয়া যায়নি।</div>
              <div className="text-xs mt-1">Run seed_db.py to add demo plots.</div>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {plots.slice(0, 10).map((plot) => (
                <Link
                  key={plot.id}
                  href={`/plot/${plot.id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/40 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                      <Sprout className="w-4 h-4 text-teal-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-200 group-hover:text-white">
                        {plot.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {plot.farmer_name ?? "—"} · {plot.area_ha ? `${plot.area_ha} ha` : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {plot.is_demo && (
                      <span className="text-xs text-amber-400/70 bg-amber-500/10 px-2 py-0.5 rounded">
                        Demo
                      </span>
                    )}
                    <span className="text-slate-600 group-hover:text-teal-400 text-sm">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* System Status */}
        {health && (
          <div className="card p-5">
            <h2 className="font-semibold text-white mb-4">সিস্টেম স্ট্যাটাস (System Status)</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(health.components).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-800/50">
                  <span className="text-xs text-slate-400 capitalize">{key.replace(/_/g, " ")}</span>
                  <span className={`text-xs font-mono ${
                    val === "ok" || val === "DEMO" || val === "mock"
                      ? "text-emerald-400"
                      : val.startsWith("error")
                      ? "text-rose-400"
                      : "text-slate-300"
                  }`}>
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Methodology / Data Sources */}
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-2">Methodology / Data Sources</h2>
          <p className="text-xs text-slate-500 mb-4">
            Actual pipeline implemented in this platform:
          </p>
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-col items-center gap-1 w-full text-center">
              <span className="text-xs font-medium text-teal-400 bg-teal-500/10 px-2 py-1 rounded">Sentinel-2 (Demo Rasters)</span>
              <span className="text-slate-600">↓</span>
              <span className="text-[10px] text-slate-400">Cloud masking / temporal composites</span>
            </div>
            
            <div className="hidden md:block text-slate-600">→</div>
            
            <div className="flex flex-col items-center gap-1 w-full text-center">
              <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Salinity Mapping (RF Baseline)</span>
              <span className="text-slate-600">↓</span>
              <span className="text-[10px] text-slate-400">Rainfall + Tide + Groundwater</span>
            </div>
            
            <div className="hidden md:block text-slate-600">→</div>
            
            <div className="flex flex-col items-center gap-1 w-full text-center">
              <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded">30-90 Day Forecast</span>
              <span className="text-slate-600">↓</span>
              <span className="text-[10px] text-slate-400">Crop Suitability Matching</span>
            </div>
            
            <div className="hidden md:block text-slate-600">→</div>
            
            <div className="flex flex-col items-center gap-1 w-full text-center">
              <span className="text-xs font-medium text-purple-400 bg-purple-500/10 px-2 py-1 rounded">Bengali AI Advisory</span>
              <span className="text-slate-600">↓</span>
              <span className="text-[10px] text-slate-400">Google TTS Voice / SMS</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
