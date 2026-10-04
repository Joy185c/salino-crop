"use client";

import { ArrowRight, Satellite, Crosshair, CloudRain, Waves, Droplet, Sprout } from "lucide-react";

export default function DataSourcesPage() {
  return (
    <div className="min-h-[calc(100vh-75px)] bg-[#f4f7fb] py-12">
      <main className="max-w-[1400px] mx-auto px-6 overflow-hidden">
        
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">Our Data Sources</h1>
          <p className="text-sm font-bold text-[#475569] mt-2">We combine multiple sources for accurate salinity forecasting.</p>
        </div>

        {/* Sources Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 mb-12 overflow-x-auto pb-4">
          
          {/* Card 1 */}
          <div className="flex flex-col items-center bg-[#f0f9ff] border border-[#e0f2fe] rounded-2xl p-5 w-40 h-48 shrink-0 text-center shadow-sm">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-[#0ea5e9]">
              <Satellite className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-extrabold text-[#0f172a] mb-1">Sentinel-2</h3>
            <p className="text-xs font-semibold text-[#475569] leading-tight">Optical Imagery<br/>(salinity mapping)</p>
          </div>

          <ArrowRight className="hidden md:block w-5 h-5 text-gray-400 shrink-0" />

          {/* Card 2 */}
          <div className="flex flex-col items-center bg-[#f0fdfa] border border-[#ccfbf1] rounded-2xl p-5 w-40 h-48 shrink-0 text-center shadow-sm">
            <div className="w-12 h-12 bg-[#0f766e] rounded-full flex items-center justify-center shadow-sm mb-4 text-white">
              <Crosshair className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-extrabold text-[#0f172a] mb-1">Sentinel-1</h3>
            <p className="text-xs font-semibold text-[#475569] leading-tight">Radar data<br/>(robust to clouds)</p>
          </div>

          <ArrowRight className="hidden md:block w-5 h-5 text-gray-400 shrink-0" />

          {/* Card 3 */}
          <div className="flex flex-col items-center bg-[#f0fdf4] border border-[#dcfce7] rounded-2xl p-5 w-40 h-48 shrink-0 text-center shadow-sm">
            <div className="w-12 h-12 bg-[#10b981] rounded-full flex items-center justify-center shadow-sm mb-4 text-white">
              <CloudRain className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-extrabold text-[#0f172a] mb-1">Rainfall</h3>
            <p className="text-xs font-semibold text-[#475569] leading-tight">Precipitation<br/>patterns</p>
          </div>

          <ArrowRight className="hidden md:block w-5 h-5 text-gray-400 shrink-0" />

          {/* Card 4 */}
          <div className="flex flex-col items-center bg-[#ecfdf5] border border-[#d1fae5] rounded-2xl p-5 w-40 h-48 shrink-0 text-center shadow-sm">
            <div className="w-12 h-12 bg-[#059669] rounded-full flex items-center justify-center shadow-sm mb-4 text-white">
              <Waves className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-extrabold text-[#0f172a] mb-1">Tides</h3>
            <p className="text-xs font-semibold text-[#475569] leading-tight">Coastal water<br/>levels</p>
          </div>

          <ArrowRight className="hidden md:block w-5 h-5 text-gray-400 shrink-0" />

          {/* Card 5 */}
          <div className="flex flex-col items-center bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-5 w-40 h-48 shrink-0 text-center shadow-sm">
            <div className="w-12 h-12 bg-[#16a34a] rounded-full flex items-center justify-center shadow-sm mb-4 text-white">
              <Droplet className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-extrabold text-[#0f172a] mb-1">Groundwater</h3>
            <p className="text-xs font-semibold text-[#475569] leading-tight">Subsurface<br/>salinity</p>
          </div>

          <ArrowRight className="hidden md:block w-5 h-5 text-gray-400 shrink-0" />

          {/* Card 6 */}
          <div className="flex flex-col items-center bg-[#dcfce7] border border-[#86efac] rounded-2xl p-5 w-40 h-48 shrink-0 text-center shadow-sm">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-[#16a34a]">
              <Sprout className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-extrabold text-[#0f172a] mb-1">Ground EC</h3>
            <p className="text-xs font-semibold text-[#475569] leading-tight">Extension officer<br/>measurements</p>
          </div>
          
        </div>

        {/* Workflow Bottom Row */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
          <div className="bg-[#dcfce7] text-[#14532d] px-6 py-3 rounded-xl font-extrabold text-sm border border-[#bbf7d0] shadow-sm">Data Processing</div>
          <ArrowRight className="w-4 h-4 text-[#94a3b8]" />
          
          <div className="bg-[#dcfce7] text-[#14532d] px-6 py-3 rounded-xl font-extrabold text-sm border border-[#bbf7d0] shadow-sm">Salinity Mapping</div>
          <ArrowRight className="w-4 h-4 text-[#94a3b8]" />
          
          <div className="bg-[#dcfce7] text-[#14532d] px-6 py-3 rounded-xl font-extrabold text-sm border border-[#bbf7d0] shadow-sm">Forecasting</div>
          <ArrowRight className="w-4 h-4 text-[#94a3b8]" />
          
          <div className="bg-[#dcfce7] text-[#14532d] px-6 py-3 rounded-xl font-extrabold text-sm border border-[#bbf7d0] shadow-sm">Crop Matching</div>
          <ArrowRight className="w-4 h-4 text-[#94a3b8]" />
          
          <div className="bg-[#dcfce7] text-[#14532d] px-6 py-3 rounded-xl font-extrabold text-sm border border-[#bbf7d0] shadow-sm">Bengali Advisory</div>
        </div>

      </main>
    </div>
  );
}
