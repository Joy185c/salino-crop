"use client";

import Link from "next/link";
import { ArrowLeft, MapPin, Navigation, Info } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  ComposedChart
} from "recharts";

export default function PlotDetailsPrototype() {
  const chartData = [
    { name: "Now", ec: 4.8, rangeMin: 3.5, rangeMax: 5.5 },
    { name: "30D", ec: 5.4, rangeMin: 4.0, rangeMax: 6.2 },
    { name: "60D", ec: 6.1, rangeMin: 4.5, rangeMax: 6.8 },
    { name: "90D", ec: 6.8, rangeMin: 4.8, rangeMax: 7.2 },
  ];

  return (
    <div className="min-h-[calc(100vh-75px)] bg-[#f4f7fb] p-6 lg:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-2xl font-extrabold text-gray-900">Plot ID: SC-SAT-001</h1>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 rounded-full border border-red-100">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-[11px] font-extrabold text-red-600 tracking-wide uppercase">High Risk</span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm font-semibold text-gray-600">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Patuakhali, Bangladesh</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-emerald-600" />
                <span>22.3567, 90.3245</span>
              </div>
            </div>
          </div>
          
          <Link 
            href="/map" 
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-sm font-bold rounded-xl transition-colors border border-emerald-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Map
          </Link>
        </div>

        {/* Top Cards Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Current Salinity Card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-emerald-50 to-green-100/50 p-6 rounded-3xl border border-emerald-100 shadow-sm relative overflow-hidden">
            <h2 className="text-[11px] font-extrabold text-emerald-800 tracking-widest uppercase mb-4">Current Root-Zone Salinity</h2>
            <div className="flex items-end gap-3">
              <div className="text-7xl font-black text-gray-900 leading-none">4.8</div>
              <div className="pb-2">
                <div className="text-xl font-black text-gray-900 mb-1">dS/m</div>
                <div className="inline-block px-4 py-1 bg-orange-100 text-orange-600 text-xs font-extrabold rounded-full border border-orange-200 shadow-sm">
                  High Risk
                </div>
              </div>
            </div>
          </div>

          {/* Forecast Card */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-sm font-extrabold text-gray-900 mb-6">Forecast (dS/m)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 30 Days */}
              <div className="bg-[#f8fafc] rounded-2xl p-4 flex flex-col items-center justify-center border border-gray-100">
                <div className="text-xs font-bold text-gray-800 mb-2">30 Days</div>
                <div className="text-3xl font-black text-gray-900 mb-2">5.4</div>
                <div className="px-3 py-1 bg-amber-100 text-amber-600 text-[10px] font-extrabold rounded-full uppercase tracking-wide">
                  Moderate
                </div>
              </div>
              {/* 60 Days */}
              <div className="bg-[#f8fafc] rounded-2xl p-4 flex flex-col items-center justify-center border border-gray-100">
                <div className="text-xs font-bold text-gray-800 mb-2">60 Days</div>
                <div className="text-3xl font-black text-red-500 mb-2">6.1</div>
                <div className="px-3 py-1 bg-orange-100 text-orange-600 text-[10px] font-extrabold rounded-full uppercase tracking-wide">
                  High
                </div>
              </div>
              {/* 90 Days */}
              <div className="bg-[#f8fafc] rounded-2xl p-4 flex flex-col items-center justify-center border border-gray-100">
                <div className="text-xs font-bold text-gray-800 mb-2">90 Days</div>
                <div className="text-3xl font-black text-red-600 mb-2">6.8</div>
                <div className="px-3 py-1 bg-red-100 text-red-600 text-[10px] font-extrabold rounded-full uppercase tracking-wide">
                  Critical
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Chart Card */}
          <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-sm font-extrabold text-gray-900 mb-6">Salinity Forecast</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#0f172a', fontWeight: 'bold', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#0f172a', fontWeight: 'bold', fontSize: 12 }} 
                    domain={[0, 8]}
                    ticks={[0, 2, 4, 6, 8]}
                    label={{ value: 'EC (dS/m)', angle: -90, position: 'insideLeft', fontWeight: 'bold', fontSize: 12, fill: '#0f172a' }}
                  />
                  <Area type="monotone" dataKey="rangeMax" stroke="none" fill="#e0e7ff" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="rangeMin" stroke="none" fill="#ffffff" fillOpacity={1} />
                  <Line 
                    type="monotone" 
                    dataKey="ec" 
                    stroke="#f87171" 
                    strokeWidth={3}
                    dot={{ r: 6, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }}
                    label={{ position: 'top', fill: '#0f172a', fontWeight: '900', fontSize: 14, dy: -10 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Legend */}
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
                <span className="text-xs font-bold text-gray-700">Predicted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-[#e0e7ff]"></div>
                <span className="text-xs font-bold text-gray-700">Range</span>
              </div>
            </div>
          </div>

          {/* Right Sidebar Card */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-8 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-gray-800">Risk Level</span>
                <span className="px-4 py-1.5 bg-orange-100 text-orange-600 text-[11px] font-extrabold rounded-md uppercase tracking-wide">
                  High
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-gray-800">Confidence</span>
                <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 text-[11px] font-extrabold rounded-md uppercase tracking-wide">
                  Model-based
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-gray-800">Data Quality</span>
                <span className="px-4 py-1.5 bg-sky-100 text-sky-600 text-[11px] font-extrabold rounded-md uppercase tracking-wide">
                  Good
                </span>
              </div>
            </div>

            {/* Decorative Leaves */}
            <div className="absolute -bottom-10 -right-10 opacity-80 pointer-events-none w-48 h-48 bg-gradient-to-tl from-emerald-500 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 p-4 opacity-50">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21C12 21 7 17 5 11C3.5 6.5 7 2 7 2C7 2 10.5 3 14 7C17 10.5 12 21 12 21Z" fill="#22c55e"/>
                <path d="M12 21C12 21 17 17 19 11C20.5 6.5 17 2 17 2C17 2 13.5 3 10 7C7 10.5 12 21 12 21Z" fill="#16a34a"/>
                <path d="M12 21V11" stroke="#14532d" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
