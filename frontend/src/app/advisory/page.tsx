"use client";

import { useState } from "react";
import { Mic, Play, RefreshCw, Check, AlertTriangle } from "lucide-react";

const MOCK_CROPS = [
  { 
    id: 1, 
    image: "/rice_field.png",
    name: "লবণ সহনশীল ধান", 
    suitability: "Highly Suitable", 
    color: "text-primary bg-teal-50",
    points: ["বন্যা/খরা সহনশীল", "কম সারের প্রয়োজন", "উচ্চ ফলন সম্ভাবনা"],
    isRecommended: true
  },
  { 
    id: 2, 
    image: "/winter_vegetables.png",
    name: "শাকসবজি (শীতকালীন)", 
    suitability: "Suitable", 
    color: "text-primary bg-teal-50",
    points: ["লবণ সওয়া সহজজাতীয়", "স্বল্প সময়ে ফলন", "বাজারে চাহিদা বেশি"],
    isRecommended: true
  },
  { 
    id: 3, 
    image: "/winter_vegetables.png",
    name: "ডাল জাতীয় ফসল", 
    suitability: "Moderate", 
    color: "text-accent bg-accent/10",
    points: ["মাঝারি সহনশীল", "স্বল্প খরচে ফলন", "বিকল্প আয়ের উৎস"],
    isRecommended: true
  },
];

export default function AdvisoryPage() {
  const [voiceState, setVoiceState] = useState<"IDLE" | "GENERATING" | "PLAYING">("IDLE");

  const handleVoice = () => {
    if (voiceState === "IDLE") {
      setVoiceState("GENERATING");
      setTimeout(() => setVoiceState("PLAYING"), 2000);
      setTimeout(() => setVoiceState("IDLE"), 6000);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen py-8">
      <main className="max-w-6xl mx-auto space-y-8 px-6">
        
        <header className="border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-bold font-bengali text-black">আপনার জমির জন্য উপযোগী ফসল</h1>
          <p className="text-sm text-slate-500 mt-1">লবণাক্ততা পূর্বাভাস অনুযায়ী সঠিক ফসল নির্বাচন</p>
        </header>

        {/* Crop Recommendation Cards */}
        <section>
          <div className="grid md:grid-cols-3 gap-6">
            {MOCK_CROPS.map((crop) => (
              <div key={crop.id} className="card overflow-hidden bg-white">
                <img src={crop.image} alt={crop.name} className="w-full h-40 object-cover" />
                <div className="p-5 flex flex-col items-start h-full">
                  <h3 className="text-xl font-bold text-black font-bengali mb-3">{crop.name}</h3>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${crop.color}`}>
                    {crop.suitability}
                  </div>
                  
                  <ul className="space-y-2 mb-6 flex-1">
                    {crop.points.map((point, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-600 font-bengali">
                        <Check className="w-4 h-4 text-primary" /> {point}
                      </li>
                    ))}
                  </ul>
                  
                  <button className="w-full py-2.5 rounded-lg text-sm font-bold bg-teal-50 hover:bg-teal-100 text-primary transition-colors border border-teal-100">
                    বিস্তারিত দেখুন
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Voice Advisory Section */}
        <section className="mt-8 bg-teal-50 border border-teal-100 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-black font-bengali mb-2">আপনার জমির পরামর্শ</h2>
              <p className="text-slate-600 font-bengali text-lg leading-relaxed">
                আপনার জমির বর্তমান লবণাক্ততা ৪.৮ dS/m, যা আগামী ৯০ দিনে বেড়ে ৬.৮ dS/m হতে পারে। 
                এই অবস্থায় সাধারণ ধান চাষ ঝুঁকিপূর্ণ। আমরা আপনাকে লবণ-সহনশীল জাত যেমন বিনা ধান-১০ 
                চাষ করার পরামর্শ দিচ্ছি।
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleVoice}
            disabled={voiceState !== "IDLE"}
            className={`shrink-0 flex items-center gap-3 px-8 py-4 rounded-full font-bengali font-bold text-lg transition-all shadow-lg ${
              voiceState === "IDLE" ? "bg-primary hover:bg-secondary text-white" :
              voiceState === "GENERATING" ? "bg-accent text-white animate-pulse" :
              "bg-secondary text-white"
            }`}
          >
            {voiceState === "IDLE" && <Play className="w-6 h-6" />}
            {voiceState === "GENERATING" && <RefreshCw className="w-6 h-6 animate-spin" />}
            {voiceState === "PLAYING" && <Mic className="w-6 h-6 animate-pulse" />}
            {voiceState === "GENERATING" ? "তৈরি হচ্ছে..." : 
             voiceState === "PLAYING" ? "শুনছেন..." : 
             "ভয়েস শুনুন"}
          </button>
        </section>

      </main>
    </div>
  );
}
