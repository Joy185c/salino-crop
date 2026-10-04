"use client";

import Link from "next/link";
import { Search, MapPin, Navigation, ArrowRight } from "lucide-react";

const MOCK_PLOTS = [
  { id: "SC-SAT-001", location: "Satkhira, Bangladesh", district: "Satkhira", coords: "22.72, 89.07", risk: "Critical", ec: 6.8 },
  { id: "SC-SAT-002", location: "Satkhira South, Bangladesh", district: "Satkhira", coords: "22.35, 89.15", risk: "High", ec: 6.2 },
  { id: "SC-KHL-001", location: "Khulna, Bangladesh", district: "Khulna", coords: "22.81, 89.55", risk: "Moderate", ec: 5.4 },
  { id: "SC-KHL-002", location: "Dacope, Khulna", district: "Khulna", coords: "22.57, 89.51", risk: "High", ec: 5.9 },
  { id: "SC-BAG-001", location: "Bagerhat, Bangladesh", district: "Bagerhat", coords: "22.65, 89.78", risk: "Low", ec: 3.8 },
  { id: "SC-PAT-001", location: "Patuakhali, Bangladesh", district: "Patuakhali", coords: "22.36, 90.33", risk: "Moderate", ec: 4.8 },
  { id: "SC-BAR-001", location: "Barisal, Bangladesh", district: "Barisal", coords: "22.70, 90.35", risk: "Low", ec: 3.5 },
  { id: "SC-BHO-001", location: "Bhola, Bangladesh", district: "Bhola", coords: "22.18, 90.65", risk: "High", ec: 6.1 },
];

export default function PlotsDirectoryPage() {
  return (
    <div className="min-h-screen bg-[#f4f7fb] py-8">
      <main className="max-w-[1200px] mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Plots Directory</h1>
            <p className="text-sm font-semibold text-gray-600 mt-1">Browse and monitor all registered agricultural plots directly.</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Plot ID or Location..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold shadow-sm outline-none focus:border-[#166534]"
            />
          </div>
        </div>

        {/* Plots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_PLOTS.map((plot) => (
            <div key={plot.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Plot ID</div>
                  <h3 className="text-lg font-extrabold text-gray-900">{plot.id}</h3>
                </div>
                <div className={`px-3 py-1 rounded-full border text-[10px] font-extrabold uppercase tracking-wide
                  ${plot.risk === 'Critical' ? 'bg-red-50 text-red-600 border-red-100' : 
                    plot.risk === 'High' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                    plot.risk === 'Moderate' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 
                    'bg-green-50 text-green-700 border-green-100'}`}
                >
                  {plot.risk} Risk
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                  <MapPin className="w-4 h-4 text-[#166534]" />
                  {plot.location}
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                  <Navigation className="w-4 h-4 text-[#166534]" />
                  {plot.coords}
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Current EC</div>
                  <div className="text-xl font-black text-gray-900">{plot.ec.toFixed(1)} <span className="text-xs font-bold text-gray-500">dS/m</span></div>
                </div>
                
                <Link 
                  href={`/plot/${plot.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold rounded-lg transition-colors"
                >
                  View Plot <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
