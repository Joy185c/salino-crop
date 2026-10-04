"use client";

import { useState, useEffect, useRef } from "react";
import { useAssistant } from "./AssistantContext";
import { Send, Settings, Volume2, User, Sprout, AlertTriangle, ChevronDown } from "lucide-react";
import type { ChatMessage } from "@/types/assistant";
import axios from "axios";

export default function AssistantChat() {
  const { context, messages, setMessages, addMessage, setStep } = useAssistant();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Initial greeting if empty
  useEffect(() => {
    if (messages.length === 0) {
      const greeting = `আসসালামু আলাইকুম, ${context.farmer.name || 'ভাই'}।\n` + 
        (context.plot.plotId ? `আপনি **${context.plot.plotId}** জমি নিয়ে কথা বলছেন, যেটি **${context.location.district}**-এ অবস্থিত।\n` : '') +
        `আপনার জমির বর্তমান salinity risk এবং আগামী ৩০–৯০ দিনের forecast দেখে আমি পরামর্শ দিতে পারি।\n\nআপনি কী জানতে চান?`;
      
      addMessage({
        id: "msg-0",
        role: "assistant",
        content: greeting,
        timestamp: new Date().toISOString()
      });
    }
  }, []);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString()
    };
    
    addMessage(userMsg);
    setInput("");
    setIsTyping(true);

    try {
      // API call to FastAPI backend
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/assistant/chat`, {
        context,
        message: text,
        history: messages.slice(-5) // Send last 5 messages for context
      });
      
      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.data.answer,
        timestamp: new Date().toISOString(),
        scientificData: response.data.scientificData,
        cropRecommendation: response.data.cropRecommendation,
        hasAudio: !!response.data.audioUrl
      });
    } catch (error) {
      console.error(error);
      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "দুঃখিত, এই মুহূর্তে AI Assistant-এর সাথে সংযোগ করা যাচ্ছে না।",
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f4f7fb]">
      
      {/* Context Header */}
      <div className="bg-white border-b border-gray-100 p-3 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md shrink-0 flex items-center gap-1 cursor-pointer hover:bg-green-200 transition-colors">
            {context.plot.plotId || "No Plot"} <ChevronDown className="w-3 h-3" />
          </div>
          <div className="text-xs font-semibold text-gray-500 truncate">
            {context.location.district || "Unknown Loc"}
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" title="Context Active"></div>
        </div>
        <button 
          onClick={() => setStep("setup_review")}
          className="text-gray-400 hover:text-gray-700 p-1.5" 
          title="Edit Context"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, idx) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-[14px] leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-[#0f766e] text-white rounded-tr-sm' 
                : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
            }`}>
              <div className="whitespace-pre-wrap">{msg.content.replace(/\\n/g, '\n')}</div>
              
              {/* Scientific Data Card Integration */}
              {msg.scientificData && (
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-xs font-extrabold text-slate-800 mb-2 border-b pb-1">আপনার জমির অবস্থা</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block mb-0.5">Current EC</span>
                      <span className="font-black text-slate-900 text-lg">{msg.scientificData.ec} dS/m</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Risk Level</span>
                      <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{msg.scientificData.risk}</span>
                    </div>
                  </div>
                  {msg.scientificData.forecast && (
                    <div className="mt-3 text-xs font-semibold text-slate-600 flex justify-between bg-white p-2 rounded-lg border border-slate-100">
                      <span>30D: <b className="text-slate-900">{msg.scientificData.forecast.d30}</b></span>
                      <span>60D: <b className="text-slate-900">{msg.scientificData.forecast.d60}</b></span>
                      <span>90D: <b className="text-slate-900">{msg.scientificData.forecast.d90}</b></span>
                    </div>
                  )}
                </div>
              )}

              {/* Crop Recs Integration */}
              {msg.cropRecommendation && (
                <div className="mt-4 space-y-2">
                  <div className="text-xs font-extrabold text-slate-800">আপনার জমির জন্য উপযোগী:</div>
                  {msg.cropRecommendation.map(crop => (
                    <div key={crop.name} className="flex justify-between items-center p-2 bg-green-50 border border-green-100 rounded-lg">
                      <span className="font-bold text-green-900 text-xs">{crop.name}</span>
                      <span className="text-[10px] font-extrabold text-green-700 bg-green-200 px-2 py-0.5 rounded-full">{crop.suitability}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Voice Button & Timestamp */}
            <div className={`flex items-center gap-2 mt-1.5 px-1 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <span className="text-[10px] font-semibold text-gray-400">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {msg.role === 'assistant' && (
                <button className="flex items-center gap-1 text-[10px] font-bold text-[#0f766e] hover:bg-teal-50 px-2 py-1 rounded-full transition-colors">
                  <Volume2 className="w-3 h-3" /> শুনুন
                </button>
              )}
            </div>

            {/* Quick Questions (only after first AI message) */}
            {idx === 0 && messages.length === 1 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {["🌾 কোন ফসল চাষ করব?", "📈 ৯০ দিনে লবণাক্ততা কত হতে পারে?", "🧂 আমার জমির অবস্থা কেমন?", "💧 কীভাবে ঝুঁকি কমাব?"].map(q => (
                  <button 
                    key={q} 
                    onClick={() => handleSend(q)}
                    className="bg-white border border-teal-100 text-teal-800 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm hover:bg-teal-50 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm p-4 shadow-sm flex gap-1">
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-gray-100 shrink-0">
        <form 
          onSubmit={e => { e.preventDefault(); handleSend(input); }}
          className="flex items-center gap-2 bg-[#f4f7fb] border border-gray-200 rounded-full pr-1.5 pl-4 py-1.5"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="আপনার প্রশ্ন লিখুন..."
            className="flex-1 bg-transparent text-sm font-semibold outline-none text-gray-800"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-8 h-8 rounded-full bg-[#16a34a] text-white flex items-center justify-center disabled:opacity-50 shrink-0"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
