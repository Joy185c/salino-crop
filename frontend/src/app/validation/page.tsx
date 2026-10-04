"use client";

import { useState } from "react";
import { CheckCircle2, MapPin, Calendar, ArrowRight } from "lucide-react";

export default function ValidationPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    plotId: "SC-SAT-001",
    ec: "4.8",
    depth: "15",
    dateTime: "2025-05-28 10:30",
    officerName: "Md. Rahman",
    notes: "Field measurement taken after rainfall."
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    // Auto-hide success after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] py-8">
      <main className="max-w-[1200px] mx-auto px-6">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Ground Validation</h1>
          <p className="text-sm font-semibold text-gray-600 mt-1">Help improve salinity predictions with field measurements.</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-lg font-extrabold text-gray-900 mb-6">Submit Field Measurement</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-extrabold text-gray-800 mb-2">Plot ID <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.plotId}
                    onChange={(e) => setFormData({...formData, plotId: e.target.value})}
                    className="w-full bg-white border border-gray-200 text-gray-900 font-bold text-sm py-2.5 px-3 rounded-lg shadow-sm outline-none focus:border-[#166534]" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-gray-800 mb-2">EC (dS/m) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={formData.ec}
                    onChange={(e) => setFormData({...formData, ec: e.target.value})}
                    className="w-full bg-white border border-gray-200 text-gray-900 font-bold text-sm py-2.5 px-3 rounded-lg shadow-sm outline-none focus:border-[#166534]" 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-extrabold text-gray-800 mb-2">Soil Depth (cm) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    value={formData.depth}
                    onChange={(e) => setFormData({...formData, depth: e.target.value})}
                    className="w-full bg-white border border-gray-200 text-gray-900 font-bold text-sm py-2.5 px-3 rounded-lg shadow-sm outline-none focus:border-[#166534]" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-gray-800 mb-2">Date & Time <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={formData.dateTime}
                      onChange={(e) => setFormData({...formData, dateTime: e.target.value})}
                      className="w-full bg-white border border-gray-200 text-gray-900 font-bold text-sm py-2.5 px-3 pr-10 rounded-lg shadow-sm outline-none focus:border-[#166534]" 
                      required 
                    />
                    <Calendar className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-800 mb-2">Officer Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.officerName}
                  onChange={(e) => setFormData({...formData, officerName: e.target.value})}
                  className="w-full bg-white border border-gray-200 text-gray-900 font-bold text-sm py-2.5 px-3 rounded-lg shadow-sm outline-none focus:border-[#166534]" 
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-800 mb-2">Location / GPS</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-[#f8fafc] border border-gray-200 text-[#475569] font-bold text-sm py-2.5 pl-10 pr-3 rounded-lg shadow-sm outline-none focus:border-[#166534]">
                    <option>Auto-detected</option>
                  </select>
                  <MapPin className="w-4 h-4 text-[#0f766e] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-800 mb-2">Notes</label>
                <textarea 
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full bg-white border border-gray-200 text-gray-900 font-bold text-sm py-2.5 px-3 rounded-lg shadow-sm outline-none focus:border-[#166534] resize-none"
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full mt-2 bg-[#0f766e] hover:bg-[#0d635c] text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors"
              >
                Submit Ground Measurement <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right Column: Status & Recent */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Success Card */}
            <div className={`rounded-2xl border p-6 md:p-8 flex flex-col items-center text-center transition-all duration-300 ${isSubmitted ? 'bg-[#f0fdf4] border-[#bbf7d0]' : 'bg-[#f0fdf4] border-[#bbf7d0] opacity-100'}`}>
              <div className="w-16 h-16 bg-[#16a34a] rounded-full flex items-center justify-center shadow-lg shadow-green-200 mb-6">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-[#065f46] text-lg font-extrabold leading-tight mb-6 w-3/4">Measurement submitted successfully!</h3>
              
              <div className="w-full bg-transparent space-y-3 text-left">
                <div className="flex justify-between items-center px-4">
                  <span className="text-[#064e3b] font-bold text-sm">Plot ID:</span>
                  <span className="text-gray-900 font-black text-sm">{formData.plotId}</span>
                </div>
                <div className="flex justify-between items-center px-4">
                  <span className="text-[#064e3b] font-bold text-sm">EC:</span>
                  <span className="text-gray-900 font-black text-sm">{formData.ec} dS/m</span>
                </div>
                <div className="flex justify-between items-center px-4">
                  <span className="text-[#064e3b] font-bold text-sm">Date:</span>
                  <span className="text-gray-900 font-black text-sm">{formData.dateTime.split(' ')[0]}</span>
                </div>
              </div>

              <p className="text-[#065f46] text-sm font-semibold mt-6 px-2">
                Thank you. This measurement can help improve future predictions.
              </p>
            </div>

            {/* Recent Measurements Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex-1">
              <h3 className="text-base font-extrabold text-gray-900 mb-6">Recent Measurements</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] rounded-lg">
                      <th className="py-2.5 px-3 text-xs font-extrabold text-gray-800 rounded-l-lg">Date</th>
                      <th className="py-2.5 px-3 text-xs font-extrabold text-gray-800">EC (dS/m)</th>
                      <th className="py-2.5 px-3 text-xs font-extrabold text-gray-800 rounded-r-lg">Officer</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-semibold text-gray-700 divide-y divide-gray-50">
                    <tr>
                      <td className="py-3.5 px-3">2025-05-28</td>
                      <td className="py-3.5 px-3 text-gray-900 font-extrabold">4.8</td>
                      <td className="py-3.5 px-3 text-gray-600">Md. Rahman</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-3">2025-05-20</td>
                      <td className="py-3.5 px-3 text-gray-900 font-extrabold">5.1</td>
                      <td className="py-3.5 px-3 text-gray-600">Farida Akter</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-3 border-b border-transparent">2025-05-15</td>
                      <td className="py-3.5 px-3 text-gray-900 font-extrabold">5.3</td>
                      <td className="py-3.5 px-3 text-gray-600">Hasan Ali</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <button className="mt-4 text-[#16a34a] hover:text-[#15803d] text-sm font-extrabold flex items-center gap-1 transition-colors">
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
