"use client";

import { useState } from "react";
import { ChevronDown, Leaf } from "lucide-react";

export default function MethodologyPage() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (title: string) => {
    setOpenSection(openSection === title ? null : title);
  };

  const steps = [
    {
      id: "1",
      icon: <Leaf className="w-5 h-5" />,
      title: "Satellite Data",
      desc: "Sentinel-2 multispectral information",
    },
    {
      id: "2",
      title: "Preprocessing",
      desc: "Cloud masking & temporal composites",
    },
    {
      id: "3",
      title: "Salinity Mapping",
      desc: "Estimation of coastal salinity patterns",
    },
    {
      id: "4",
      title: "Root-Zone Forecast",
      desc: "30-90 day prediction using temporal data",
    },
    {
      id: "5",
      title: "Crop Matching",
      desc: "Matching with crop tolerance thresholds",
    },
    {
      id: "6",
      title: "Bengali Advisory",
      desc: "Farmer-friendly guidance (AI-assisted)",
    }
  ];

  const technicalDetails = [
    {
      title: "Salinity Mapping",
      content: "We use machine learning models trained on historical Sentinel-2 data to correlate surface reflectance with measured EC values from ground sensors."
    },
    {
      title: "Forecasting Model",
      content: "Our predictive model utilizes time-series analysis and environmental drivers (rainfall, tides) to forecast future root-zone salinity changes up to 90 days."
    },
    {
      title: "Crop Suitability",
      content: "Crops are matched using established agronomic thresholds for salt tolerance, identifying varieties that can thrive under forecasted conditions."
    },
    {
      title: "Limitations",
      content: "Predictions are subject to sudden extreme weather events (e.g., cyclones) which may cause abrupt salinity spikes not captured by long-term trends."
    }
  ];

  return (
    <div className="min-h-screen bg-[#f4f7fb] py-10">
      <main className="max-w-[1000px] mx-auto px-6">
        
        {/* Main Content Card */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-12 md:gap-8">
          
          {/* Left Column: Pipeline */}
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">How SalinO-Crop Works</h1>
            <p className="text-sm font-bold text-gray-500 mb-8">A science-backed, transparent pipeline.</p>
            
            <div className="space-y-6">
              {steps.map((step) => (
                <div key={step.id} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#0f766e] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 font-bold text-sm">
                    {step.icon ? step.icon : step.id}
                  </div>
                  <div>
                    <h3 className="text-[15px] font-extrabold text-[#0f766e]">{step.title}</h3>
                    <p className="text-[13px] font-semibold text-gray-500 leading-tight mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Accordion */}
          <div className="flex-1">
            <div className="bg-[#f0f9ff] rounded-2xl p-6 border border-[#e0f2fe]">
              <h2 className="text-base font-extrabold text-gray-900 mb-6">Technical Details</h2>
              
              <div className="space-y-3">
                {technicalDetails.map((detail) => (
                  <div key={detail.title} className="bg-[#f0f9ff] border-b border-[#e0f2fe] last:border-b-0 pb-3 last:pb-0">
                    <button 
                      onClick={() => toggleSection(detail.title)}
                      className="w-full flex items-center justify-between py-2 text-left group"
                    >
                      <span className="text-[15px] font-extrabold text-[#0f172a] group-hover:text-[#0f766e] transition-colors">
                        {detail.title}
                      </span>
                      <ChevronDown 
                        className={`w-5 h-5 text-[#0f172a] transition-transform duration-200 ${openSection === detail.title ? 'rotate-180' : ''}`} 
                      />
                    </button>
                    
                    <div className={`overflow-hidden transition-all duration-300 ${openSection === detail.title ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                      <p className="text-[13px] font-semibold text-[#475569] leading-relaxed pr-4">
                        {detail.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
