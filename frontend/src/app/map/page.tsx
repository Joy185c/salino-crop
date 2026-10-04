"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Plot, SalinityData, ForecastData } from "@/types";

// Dynamically import the map component to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false, loading: () => <div className="absolute inset-0 bg-[#e5e7eb] animate-pulse flex items-center justify-center text-slate-400 font-bold">Loading Satellite Map...</div> });

const HORIZON_OPTIONS = [0, 30, 60, 90] as const;

export default function MapPage() {
  const [horizon, setHorizon] = useState<0 | 30 | 60 | 90>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [selectedSalinity, setSelectedSalinity] = useState<SalinityData | null>(null);
  const [selectedForecast, setSelectedForecast] = useState<ForecastData | null>(null);
  const [loadingSalinity, setLoadingSalinity] = useState(false);

  // Horizon syncing is now handled cleanly by MapComponent which has access to the full mock data.

  return (
    <div className="bg-[#f4f7fb] flex flex-col p-4 md:p-6" style={{ height: "calc(100vh - 75px)" }}>
      <main className="flex-1 relative bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col">
        
        {/* Map Container using Leaflet (SSR Disabled) */}
        <div className="flex-1 relative bg-[#e5e7eb] overflow-hidden">
          <MapComponent 
            horizon={horizon} 
            searchQuery={searchQuery}
            setSelectedPlot={setSelectedPlot}
            setSelectedSalinity={setSelectedSalinity}
            setSelectedForecast={setSelectedForecast}
            setLoadingSalinity={setLoadingSalinity}
          />
        </div>

        {/* Floating Top Controls */}
        <div className="absolute top-6 left-0 right-0 flex justify-center pointer-events-none z-[1000]">
          <div className="bg-white rounded-full shadow-lg p-1.5 flex items-center gap-1 pointer-events-auto border border-slate-100">
            {HORIZON_OPTIONS.map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-5 py-2 text-xs font-bold uppercase rounded-full transition-all ${
                  horizon === h
                    ? "bg-[#166534] text-white shadow-sm"
                    : "text-[#475569] hover:bg-slate-50"
                }`}
              >
                {h === 0 ? "Current" : `${h} Days`}
              </button>
            ))}
          </div>
        </div>

        {/* Floating Search Bar (Top Left) */}
        <div className="absolute top-6 left-6 z-[1000]">
          <div className="bg-white rounded-full shadow-lg px-4 py-3 flex items-center gap-3 w-64 border border-slate-100 pointer-events-auto">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Search location..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 w-full placeholder:text-slate-400" 
            />
          </div>
        </div>

        {/* Floating Layer Selector (Top Right) */}
        <div className="absolute top-6 right-6 z-[1000]">
          <div className="bg-white rounded-full shadow-lg px-4 py-2.5 flex items-center gap-2 border border-slate-100 cursor-pointer text-sm font-bold text-slate-700">
            Layer: Salinity ({horizon === 0 ? "Current" : `${horizon} Days`})
            <svg className="w-4 h-4 text-slate-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

        {/* Floating Legend (Bottom Left) */}
        <div className="absolute bottom-6 left-6 z-[1000]">
          <div className="bg-white rounded-full shadow-lg px-5 py-3 flex items-center gap-4 border border-slate-100">
            <span className="text-sm font-bold text-slate-800">Salinity Risk:</span>
            {[
              { label: "Low", color: "#10b981" },
              { label: "Moderate", color: "#a3e635" },
              { label: "High", color: "#f97316" },
              { label: "Critical", color: "#ef4444" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full" style={{ background: item.color }} />
                <span className="text-xs font-bold text-slate-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Side Panel (Selected Plot Details) */}
        {selectedPlot && selectedSalinity && (
          <div className="absolute bottom-6 left-6 right-6 md:bottom-auto md:top-20 md:left-auto md:right-6 z-[1000] md:w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 animate-slide-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-extrabold text-gray-900 text-lg">Selected Plot</h2>
              <Link href={`/plot/${selectedPlot.id}`} className="text-[#0f766e] text-xs font-bold hover:underline">View Details &gt;</Link>
            </div>

            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border mb-4 ${selectedSalinity.risk_level === 'very_high' ? 'bg-red-50 border-red-100' : selectedSalinity.risk_level === 'high' ? 'bg-orange-50 border-orange-100' : 'bg-green-50 border-green-100'}`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${selectedSalinity.risk_level === 'very_high' ? 'bg-red-600' : selectedSalinity.risk_level === 'high' ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                <span className={`text-[10px] font-extrabold uppercase tracking-wider ${selectedSalinity.risk_level === 'very_high' ? 'text-red-600' : selectedSalinity.risk_level === 'high' ? 'text-orange-600' : 'text-green-700'}`}>{selectedSalinity.risk_level} RISK</span>
            </div>

            <div className="mb-4">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Plot ID</div>
              <div className="text-sm font-extrabold text-gray-900">{selectedPlot.id}</div>
            </div>

            <div className="mb-4 pb-4 border-b border-gray-100">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Location</div>
              <div className="text-sm font-semibold text-gray-600">Coastal Region, Bangladesh</div>
            </div>

            <div className="mb-6">
              <div className="text-xs font-bold text-gray-900 mb-1">Predicted Salinity</div>
              <div className="flex items-end gap-1">
                <div className="text-3xl font-extrabold text-[#166534] leading-none">{(selectedSalinity.ec_ds_m || 0).toFixed(1)}</div>
                <div className="text-sm font-bold text-[#166534] leading-relaxed">dS/m</div>
              </div>
            </div>

            {horizon === 0 && (
              <div className="grid grid-cols-3 gap-2 mb-6">
                {[
                  { label: "30D", val: selectedForecast?.ec_30d || "5.4", risk: selectedForecast?.risk_30d || "Moderate", c: "text-amber-500", bg: "bg-amber-50" },
                  { label: "60D", val: selectedForecast?.ec_60d || "6.1", risk: selectedForecast?.risk_60d || "High", c: "text-orange-500", bg: "bg-orange-50" },
                  { label: "90D", val: selectedForecast?.ec_90d || "6.8", risk: selectedForecast?.risk_90d || "Critical", c: "text-red-600", bg: "bg-red-100" },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-2 flex flex-col items-center justify-center border border-gray-100">
                    <div className="text-[10px] font-extrabold text-gray-800 mb-1">{item.label}</div>
                    <div className="text-lg font-extrabold text-gray-900 leading-none mb-1">{item.val}</div>
                    <div className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase ${item.c} ${item.bg}`}>{item.risk}</div>
                  </div>
                ))}
              </div>
            )}

            <Link
              href={`/advisory?plot=${selectedPlot.id}`}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#166534] hover:bg-[#14532d] text-white text-sm font-bold rounded-xl transition-all shadow-md"
            >
              View Plot Advisory <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
