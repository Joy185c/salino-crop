"use client";

import { useState } from "react";
import { ChevronDown, Plus, Minus, Target, CloudRain, Waves, Droplet, TrendingUp, ArrowUpRight } from "lucide-react";

export default function ForecastPage() {
  const [area, setArea] = useState("Patuakhali");
  const [horizon, setHorizon] = useState("30 Days");
  const [risk, setRisk] = useState("All");

  return (
    <div className="bg-[#f4f7fb] min-h-screen pb-12 pt-6">
      <main className="max-w-[1200px] mx-auto px-6">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">How could salinity change?</h1>
          <p className="text-sm font-semibold text-gray-600 mt-1">Explore forecast trends for different areas and time horizons.</p>
        </div>

        {/* Filters Section */}
        <div className="flex flex-wrap items-end gap-6 mb-6">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label className="text-[11px] font-extrabold text-gray-800 uppercase tracking-wider">Area</label>
            <div className="relative">
              <select 
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-200 text-gray-900 font-bold text-sm py-2.5 pl-4 pr-10 rounded-xl shadow-sm outline-none focus:border-[#166534]"
              >
                <option value="Patuakhali">Patuakhali</option>
                <option value="Khulna">Khulna</option>
                <option value="Satkhira">Satkhira</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label className="text-[11px] font-extrabold text-gray-800 uppercase tracking-wider">Forecast Horizon</label>
            <div className="relative">
              <select 
                value={horizon}
                onChange={(e) => setHorizon(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-200 text-gray-900 font-bold text-sm py-2.5 pl-4 pr-10 rounded-xl shadow-sm outline-none focus:border-[#166534]"
              >
                <option value="30 Days">30 Days</option>
                <option value="60 Days">60 Days</option>
                <option value="90 Days">90 Days</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label className="text-[11px] font-extrabold text-gray-800 uppercase tracking-wider">Risk Level</label>
            <div className="relative">
              <select 
                value={risk}
                onChange={(e) => setRisk(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-200 text-gray-900 font-bold text-sm py-2.5 pl-4 pr-10 rounded-xl shadow-sm outline-none focus:border-[#166534]"
              >
                <option value="All">All</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Left: Map Widget */}
          <div className="bg-white rounded-3xl p-3 shadow-sm border border-gray-100 flex flex-col h-[550px] relative overflow-hidden">
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-100">
              <img 
                src="/heatmap.png" 
                alt="Salinity Heatmap" 
                className="absolute inset-0 w-full h-full object-cover opacity-90 scale-105"
              />
              
              {/* Fake City Labels */}
              <div className="absolute top-[35%] left-[25%] text-white font-extrabold text-sm drop-shadow-md">Khulna</div>
              <div className="absolute top-[35%] right-[25%] text-white font-extrabold text-sm drop-shadow-md">Barisal</div>
              <div className="absolute top-[55%] right-[30%] text-white font-extrabold text-sm drop-shadow-md">Patuakhali</div>
              
              {/* Map Controls */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <div className="bg-white rounded-lg shadow-md flex flex-col overflow-hidden">
                  <button className="p-2.5 hover:bg-gray-50 border-b border-gray-100 text-gray-700">
                    <Plus className="w-5 h-5" />
                  </button>
                  <button className="p-2.5 hover:bg-gray-50 text-gray-700">
                    <Minus className="w-5 h-5" />
                  </button>
                </div>
                <button className="bg-white p-2.5 rounded-lg shadow-md hover:bg-gray-50 text-gray-700 mt-2">
                  <Target className="w-5 h-5" />
                </button>
              </div>

              {/* Legend Bottom */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-4 text-xs font-bold text-gray-800">
                  <span className="mr-2">Salinity Risk:</span>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500"></div> Low</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-yellow-400"></div> Moderate</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-orange-500"></div> High</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-600"></div> Critical</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Data Cards */}
          <div className="flex flex-col gap-6">
            
            {/* Forecast Summary */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-base font-extrabold text-gray-900 mb-6">Forecast Summary</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Current */}
                <div className="bg-orange-50/50 rounded-2xl p-4 flex flex-col items-center justify-center border border-orange-100/50">
                  <div className="text-[11px] font-extrabold text-gray-700 mb-2">Current</div>
                  <div className="text-3xl font-extrabold text-gray-900 leading-none mb-1">4.8</div>
                  <div className="text-[10px] font-bold text-red-600 mb-3">High</div>
                  <div className="bg-orange-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wide">High</div>
                </div>

                {/* 30 Days */}
                <div className="bg-yellow-50/50 rounded-2xl p-4 flex flex-col items-center justify-center border border-yellow-100/50 shadow-sm shadow-yellow-100">
                  <div className="text-[11px] font-extrabold text-[#166534] mb-2">30 Days</div>
                  <div className="text-3xl font-extrabold text-gray-900 leading-none mb-1">5.4</div>
                  <div className="text-[10px] font-bold text-orange-600 mb-3">dS/m</div>
                  <div className="bg-yellow-400 text-yellow-900 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wide">Moderate</div>
                </div>

                {/* 60 Days */}
                <div className="bg-orange-50/50 rounded-2xl p-4 flex flex-col items-center justify-center border border-orange-100/50">
                  <div className="text-[11px] font-extrabold text-gray-700 mb-2">60 Days</div>
                  <div className="text-3xl font-extrabold text-gray-900 leading-none mb-1">6.1</div>
                  <div className="text-[10px] font-bold text-red-600 mb-3">High</div>
                  <div className="bg-orange-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wide">High</div>
                </div>

                {/* 90 Days */}
                <div className="bg-red-50/50 rounded-2xl p-4 flex flex-col items-center justify-center border border-red-100/50">
                  <div className="text-[11px] font-extrabold text-gray-700 mb-2">90 Days</div>
                  <div className="text-3xl font-extrabold text-gray-900 leading-none mb-1">6.8</div>
                  <div className="text-[10px] font-bold text-red-700 mb-3">Critical</div>
                  <div className="bg-red-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wide">Critical</div>
                </div>
              </div>
            </div>

            {/* Drivers */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex-1">
              <h2 className="text-base font-extrabold text-gray-900 mb-6">What's driving the forecast?</h2>
              
              <div className="flex flex-col gap-0 divide-y divide-gray-100">
                {/* Driver 1 */}
                <div className="py-4 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                      <CloudRain className="w-5 h-5 text-[#0f766e]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-900">Rainfall</h4>
                      <p className="text-xs font-semibold text-gray-500 mt-0.5">Expected to increase</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-red-500" />
                </div>

                {/* Driver 2 */}
                <div className="py-4 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                      <Waves className="w-5 h-5 text-[#0f766e]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-900">Tide</h4>
                      <p className="text-xs font-semibold text-gray-500 mt-0.5">Moderate influence</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-red-500" />
                </div>

                {/* Driver 3 */}
                <div className="py-4 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                      <Droplet className="w-5 h-5 text-[#0f766e]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-900">Groundwater</h4>
                      <p className="text-xs font-semibold text-gray-500 mt-0.5">Rising salinity risk</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-red-500" />
                </div>

                {/* Driver 4 */}
                <div className="py-4 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-900">Historical trend</h4>
                      <p className="text-xs font-semibold text-gray-500 mt-0.5">Increasing</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-red-500" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
