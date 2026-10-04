"use client";

import Link from "next/link";
import { ArrowRight, Map as MapIcon, CalendarDays, Maximize2, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="bg-[#f4f7fb] min-h-screen py-6 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
        
        {/* HERO SECTION */}
        <div className="relative min-h-[500px] flex items-center">
          {/* Background Landscape Photo (Faded) */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-right bg-no-repeat opacity-100"
            style={{ backgroundImage: "url('/hero-bg.jpg')" }}
          ></div>
          
          {/* Gradient Overlay to ensure text readability without hiding the image */}
          <div className="absolute inset-y-0 left-0 w-[60%] z-10 bg-gradient-to-r from-white/90 via-white/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-32 z-10 bg-gradient-to-t from-white to-transparent"></div>

          <div className="relative z-20 w-full px-12 py-16 flex flex-col md:flex-row items-center justify-between">
            
            {/* Left Content */}
            <div className="flex-1 max-w-2xl space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#dcfce7] text-[#15803d] text-sm font-bold tracking-tight">
                AI-Driven Climate Intelligence
              </div>
              
              <h1 className="text-5xl md:text-[64px] font-extrabold tracking-tight text-[#0f172a] leading-[1.05]">
                Predict Salinity.<br/>
                Protect the Harvest.
              </h1>
              
              <p className="text-xl text-[#334155] max-w-lg leading-relaxed font-medium mt-4">
                AI-driven root-zone salinity forecasting and crop advisory for coastal Bangladesh.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 pt-6">
                <Link 
                  href="/map"
                  className="px-8 py-3.5 rounded-full bg-[#166534] hover:bg-[#14532d] text-white font-bold flex items-center gap-2 transition-all shadow-md text-lg"
                >
                  Explore Salinity Map <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  href="/forecast"
                  className="px-8 py-3.5 rounded-full bg-[#f0fdf4] hover:bg-[#dcfce7] text-[#166534] font-bold flex items-center gap-2 transition-all border border-[#dcfce7] text-lg"
                >
                  View Forecast
                </Link>
              </div>
            </div>
            
            {/* Right Map Graphic Area (Map is in background) */}
            <div className="flex-1 relative w-full h-[450px] hidden md:flex justify-end items-center">
              
              {/* Premium Floating Animated Heatmap Blobs (Overlaying the background map's coastal area) */}
              <div className="absolute right-[15%] bottom-[15%] w-[180px] h-[100px] z-20 pointer-events-none">
                {/* Red Critical Zone */}
                <div className="absolute bottom-0 right-10 w-[100px] h-[60px] bg-red-600 rounded-full mix-blend-multiply filter blur-2xl opacity-80 animate-pulse"></div>
                <div className="absolute bottom-4 right-16 w-[60px] h-[40px] bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-90 animate-pulse" style={{ animationDelay: '1s' }}></div>
                
                {/* Yellow/Orange High Risk Zone */}
                <div className="absolute bottom-10 right-4 w-[120px] h-[50px] bg-orange-500 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute bottom-14 right-20 w-[90px] h-[50px] bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-80 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                
                {/* Green Moderate/Low Risk Zone */}
                <div className="absolute bottom-20 right-[-10px] w-[150px] h-[60px] bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-pulse" style={{ animationDelay: '2s' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* IMPACT STRIP */}
        <div className="bg-white border-y border-slate-100 px-12 relative z-30">
          <div className="py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "19", label: "Coastal Districts", icon: MapIcon },
              { value: "30–90", label: "Day Forecast", icon: CalendarDays },
              { value: "10–20m", label: "Plot-level Resolution", icon: Maximize2 },
              { value: "0", label: "Custom Sensors Required", icon: ShieldCheck }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#f0fdf4] text-[#166534] flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-[#0f172a]">{item.value}</div>
                  <div className="text-sm text-[#64748b] font-semibold">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DASHBOARD PREVIEW */}
        <div className="bg-white py-12 px-12 relative z-30">
          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Current Coastal Risk Card */}
            <div className="bg-[#f0fdf4] rounded-3xl p-8 border border-[#dcfce7] flex flex-col justify-center">
              <div className="text-lg font-bold text-[#0f172a] mb-4">Current Coastal Risk</div>
              <div className="flex items-center gap-3 text-[#f97316] mb-4">
                <AlertTriangle className="w-10 h-10" />
                <span className="text-4xl font-extrabold tracking-tight">HIGH</span>
              </div>
              <p className="text-sm text-[#475569] font-medium leading-relaxed">
                Salinity levels are elevated in several coastal regions. Monitor your area for updates.
              </p>
            </div>
            
            {/* Forecast Snapshot Card */}
            <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="text-lg font-bold text-[#0f172a] mb-6">Forecast Snapshot</div>
              
              <div className="grid grid-cols-4 gap-4 relative z-10 w-[80%]">
                {[
                  { label: "CURRENT", ec: "4.8", risk: "High", color: "text-[#ef4444]", bg: "bg-[#fef2f2]" },
                  { label: "30 DAYS", ec: "5.4", risk: "Moderate", color: "text-[#f59e0b]", bg: "bg-[#fffbeb]" },
                  { label: "60 DAYS", ec: "6.1", risk: "High", color: "text-[#ef4444]", bg: "bg-[#fef2f2]" },
                  { label: "90 DAYS", ec: "6.8", risk: "Critical", color: "text-[#dc2626]", bg: "bg-[#fef2f2]" },
                ].map((item, i) => (
                  <div key={i} className={`rounded-2xl p-4 flex flex-col items-center justify-center border border-slate-50`}>
                    <div className="text-xs font-extrabold text-[#0f172a] mb-3">{item.label}</div>
                    <div className="flex items-end gap-1 mb-3">
                      <div className="text-4xl font-extrabold text-[#0f172a] leading-none">{item.ec}</div>
                      <div className="text-sm font-bold text-[#ef4444] leading-relaxed">dS/m</div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${item.color} ${item.bg}`}>
                      {item.risk}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Plant Decoration */}
              <div className="absolute right-0 bottom-0 top-0 w-[30%] pointer-events-none">
                <img src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover opacity-90 rounded-r-3xl" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)' }} />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent"></div>
              </div>
            </div>
            
          </div>
        </div>
        
      </div>
    </div>
  );
}

const AlertTriangle = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
);
