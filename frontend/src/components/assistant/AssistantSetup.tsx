"use client";

import { useState } from "react";
import { useAssistant } from "./AssistantContext";
import { ArrowRight, ArrowLeft, CheckCircle2, User, MapPin, Map, HelpCircle } from "lucide-react";

export default function AssistantSetup() {
  const { step, setStep, context, updateContext } = useAssistant();
  const [localState, setLocalState] = useState(context);

  const handleNext = (nextStep: any) => {
    updateContext("farmer", localState.farmer);
    updateContext("location", localState.location);
    updateContext("plot", localState.plot);
    updateContext("intent", localState.intent);
    setStep(nextStep);
  };

  const renderStep1 = () => (
    <div className="flex flex-col h-full animate-fade-in p-6">
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-gray-900">আপনার সম্পর্কে</h2>
        <p className="text-sm font-semibold text-gray-500">কিছু তথ্য দিলে আপনার জন্য আরও নির্দিষ্ট পরামর্শ দিতে পারব।</p>
        <div className="text-xs font-bold text-[#16a34a] mt-2">STEP 1 OF 4</div>
      </div>
      
      <div className="space-y-4 flex-1">
        <div>
          <label className="block text-xs font-extrabold text-gray-800 mb-1">নাম *</label>
          <input 
            type="text" 
            value={localState.farmer.name}
            onChange={e => setLocalState(s => ({ ...s, farmer: { ...s.farmer, name: e.target.value } }))}
            className="w-full bg-white border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:border-[#16a34a]"
            placeholder="আপনার নাম"
          />
        </div>
        <div>
          <label className="block text-xs font-extrabold text-gray-800 mb-1">মোবাইল নম্বর (ঐচ্ছিক)</label>
          <input 
            type="text" 
            value={localState.farmer.phone}
            onChange={e => setLocalState(s => ({ ...s, farmer: { ...s.farmer, phone: e.target.value } }))}
            className="w-full bg-white border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:border-[#16a34a]"
            placeholder="01XXXXXXXXX"
          />
        </div>
        <div>
          <label className="block text-xs font-extrabold text-gray-800 mb-1">আপনি কী করেন?</label>
          <select 
            value={localState.farmer.role}
            onChange={e => setLocalState(s => ({ ...s, farmer: { ...s.farmer, role: e.target.value } }))}
            className="w-full bg-white border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:border-[#16a34a]"
          >
            <option value="">নির্বাচন করুন</option>
            <option value="কৃষক">কৃষক</option>
            <option value="কৃষি উদ্যোক্তা">কৃষি উদ্যোক্তা</option>
            <option value="জমির মালিক">জমির মালিক</option>
            <option value="কৃষি কর্মকর্তা">কৃষি কর্মকর্তা</option>
            <option value="অন্যান্য">অন্যান্য</option>
          </select>
        </div>
      </div>

      <button 
        disabled={!localState.farmer.name}
        onClick={() => handleNext("setup_location")}
        className="w-full bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-4"
      >
        পরবর্তী ধাপ <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="flex flex-col h-full animate-fade-in p-6">
      <div className="mb-6 flex items-start gap-2">
        <button onClick={() => setStep("setup_farmer")} className="mt-1 text-gray-400 hover:text-gray-800"><ArrowLeft className="w-5 h-5"/></button>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">আপনি কোথায় আছেন?</h2>
          <div className="text-xs font-bold text-[#16a34a] mt-1">STEP 2 OF 4</div>
        </div>
      </div>
      
      <div className="space-y-4 flex-1">
        <div>
          <label className="block text-xs font-extrabold text-gray-800 mb-1">জেলা *</label>
          <select 
            value={localState.location.district}
            onChange={e => setLocalState(s => ({ ...s, location: { ...s.location, district: e.target.value } }))}
            className="w-full bg-white border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:border-[#16a34a]"
          >
            <option value="">নির্বাচন করুন</option>
            <option value="Satkhira">সাতক্ষীরা (Satkhira)</option>
            <option value="Khulna">খুলনা (Khulna)</option>
            <option value="Bagerhat">বাগেরহাট (Bagerhat)</option>
            <option value="Patuakhali">পটুয়াখালী (Patuakhali)</option>
            <option value="Barguna">বরগুনা (Barguna)</option>
            <option value="Bhola">ভোলা (Bhola)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-extrabold text-gray-800 mb-1">উপজেলা (ঐচ্ছিক)</label>
          <input 
            type="text" 
            value={localState.location.upazila}
            onChange={e => setLocalState(s => ({ ...s, location: { ...s.location, upazila: e.target.value } }))}
            className="w-full bg-white border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:border-[#16a34a]"
          />
        </div>
        <div>
          <label className="block text-xs font-extrabold text-gray-800 mb-1">ইউনিয়ন / এলাকা (ঐচ্ছিক)</label>
          <input 
            type="text" 
            value={localState.location.union}
            onChange={e => setLocalState(s => ({ ...s, location: { ...s.location, union: e.target.value } }))}
            className="w-full bg-white border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:border-[#16a34a]"
          />
        </div>
      </div>

      <button 
        disabled={!localState.location.district}
        onClick={() => handleNext("setup_plot")}
        className="w-full bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-4"
      >
        পরবর্তী ধাপ <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );

  const renderStep3 = () => (
    <div className="flex flex-col h-full animate-fade-in p-6">
      <div className="mb-6 flex items-start gap-2">
        <button onClick={() => setStep("setup_location")} className="mt-1 text-gray-400 hover:text-gray-800"><ArrowLeft className="w-5 h-5"/></button>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">কোন জমি নিয়ে কথা বলতে চান?</h2>
          <div className="text-xs font-bold text-[#16a34a] mt-1">STEP 3 OF 4</div>
        </div>
      </div>
      
      <div className="space-y-4 flex-1 overflow-y-auto pr-1">
        <div>
          <label className="block text-xs font-extrabold text-gray-800 mb-1">Plot ID (যদি থাকে)</label>
          <input 
            type="text" 
            value={localState.plot.plotId}
            onChange={e => setLocalState(s => ({ ...s, plot: { ...s.plot, plotId: e.target.value } }))}
            className="w-full bg-white border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:border-[#16a34a] font-mono"
            placeholder="e.g. SC-SAT-001"
          />
        </div>
        <div>
          <label className="block text-xs font-extrabold text-gray-800 mb-1">বর্তমানে কী চাষ করছেন?</label>
          <select 
            value={localState.plot.currentCrop}
            onChange={e => setLocalState(s => ({ ...s, plot: { ...s.plot, currentCrop: e.target.value } }))}
            className="w-full bg-white border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:border-[#16a34a]"
          >
            <option value="">নির্বাচন করুন</option>
            <option value="ধান">ধান (Rice)</option>
            <option value="সবজি">সবজি (Vegetables)</option>
            <option value="ডাল">ডাল (Pulses)</option>
            <option value="কিছু না">কিছু না (Fallow)</option>
            <option value="অন্যান্য">অন্যান্য</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-extrabold text-gray-800 mb-1">জমির আয়তন</label>
            <input 
              type="text" 
              value={localState.plot.area}
              onChange={e => setLocalState(s => ({ ...s, plot: { ...s.plot, area: e.target.value } }))}
              className="w-full bg-white border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:border-[#16a34a]"
              placeholder="0.75"
            />
          </div>
          <div>
            <label className="block text-xs font-extrabold text-gray-800 mb-1">একক</label>
            <select 
              value={localState.plot.areaUnit}
              onChange={e => setLocalState(s => ({ ...s, plot: { ...s.plot, areaUnit: e.target.value as any } }))}
              className="w-full bg-white border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:border-[#16a34a]"
            >
              <option value="acre">Acre</option>
              <option value="decimal">Decimal</option>
              <option value="hectare">Hectare</option>
            </select>
          </div>
        </div>
      </div>

      <button 
        onClick={() => handleNext("setup_intent")}
        className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-4"
      >
        পরবর্তী ধাপ <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );

  const INTENTS = [
    "🌱 কী চাষ করব?",
    "🧂 আমার জমিতে লবণাক্ততা কতটা?",
    "📈 সামনে লবণাক্ততা বাড়বে কি?",
    "🌾 কোন জাত ভালো হবে?",
    "💧 সেচ / পানি ব্যবস্থাপনা",
    "📅 কখন চাষ শুরু করব?",
    "⚠️ জমির ঝুঁকি জানতে চাই",
    "🎙 সাধারণ পরামর্শ"
  ];

  const toggleIntent = (topic: string) => {
    setLocalState(s => {
      const current = s.intent.topics;
      const updated = current.includes(topic) 
        ? current.filter(t => t !== topic) 
        : [...current, topic];
      return { ...s, intent: { ...s.intent, topics: updated } };
    });
  };

  const renderStep4 = () => (
    <div className="flex flex-col h-full animate-fade-in p-6">
      <div className="mb-6 flex items-start gap-2">
        <button onClick={() => setStep("setup_plot")} className="mt-1 text-gray-400 hover:text-gray-800"><ArrowLeft className="w-5 h-5"/></button>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">আপনি কী জানতে চান?</h2>
          <div className="text-xs font-bold text-[#16a34a] mt-1">STEP 4 OF 4</div>
        </div>
      </div>
      
      <div className="space-y-2 flex-1 overflow-y-auto pr-1">
        {INTENTS.map(intent => (
          <button
            key={intent}
            onClick={() => toggleIntent(intent)}
            className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-bold transition-colors ${
              localState.intent.topics.includes(intent)
                ? 'bg-green-50 border-green-500 text-green-800'
                : 'bg-white border-gray-200 text-gray-700 hover:border-green-300'
            }`}
          >
            {intent}
          </button>
        ))}
        <div className="pt-2">
          <input 
            type="text" 
            value={localState.intent.otherIntent}
            onChange={e => setLocalState(s => ({ ...s, intent: { ...s.intent, otherIntent: e.target.value } }))}
            className="w-full bg-white border border-gray-200 p-3 rounded-xl text-sm font-semibold outline-none focus:border-[#16a34a]"
            placeholder="অন্য কিছু লিখতে চাইলে এখানে লিখুন..."
          />
        </div>
      </div>

      <button 
        onClick={() => handleNext("setup_review")}
        className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-4 shrink-0"
      >
        রিভিউ করুন <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );

  const renderReview = () => (
    <div className="flex flex-col h-full animate-fade-in p-6">
      <div className="mb-6 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900">আপনার তথ্য</h2>
        <p className="text-sm font-semibold text-gray-500">তথ্যগুলো ঠিক আছে কি না চেক করে নিন</p>
      </div>
      
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-sm text-sm">
        <div className="flex gap-3">
          <User className="w-5 h-5 text-gray-400 shrink-0" />
          <div>
            <div className="font-bold text-gray-900">{context.farmer.name}</div>
            <div className="text-xs text-gray-500">{context.farmer.role || "Role not specified"}</div>
          </div>
        </div>
        <div className="flex gap-3">
          <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
          <div>
            <div className="font-bold text-gray-900">{context.location.district}</div>
            <div className="text-xs text-gray-500">{[context.location.upazila, context.location.union].filter(Boolean).join(", ") || "No specific area"}</div>
          </div>
        </div>
        <div className="flex gap-3">
          <Map className="w-5 h-5 text-gray-400 shrink-0" />
          <div>
            <div className="font-bold text-gray-900">{context.plot.plotId || "Unknown Plot"}</div>
            <div className="text-xs text-gray-500">
              {context.plot.currentCrop ? `Crop: ${context.plot.currentCrop}` : "No crop"} 
              {context.plot.area && ` • ${context.plot.area} ${context.plot.areaUnit}`}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <HelpCircle className="w-5 h-5 text-gray-400 shrink-0" />
          <div>
            <div className="font-bold text-gray-900">Question intent:</div>
            <div className="text-xs text-gray-500 mt-1 space-y-1">
              {context.intent.topics.map(t => <div key={t}>• {t}</div>)}
              {context.intent.otherIntent && <div>• {context.intent.otherIntent}</div>}
              {context.intent.topics.length === 0 && !context.intent.otherIntent && "General assistance"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 shrink-0">
        <button 
          onClick={() => setStep("setup_farmer")}
          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-xl transition-colors"
        >
          পরিবর্তন করুন
        </button>
        <button 
          onClick={() => handleNext("chat")}
          className="bg-[#0f766e] hover:bg-[#0d635c] text-white font-bold py-3 rounded-xl transition-colors"
        >
          Assistant শুরু করুন
        </button>
      </div>
    </div>
  );

  switch (step) {
    case "setup_farmer": return renderStep1();
    case "setup_location": return renderStep2();
    case "setup_plot": return renderStep3();
    case "setup_intent": return renderStep4();
    case "setup_review": return renderReview();
    default: return null;
  }
}
