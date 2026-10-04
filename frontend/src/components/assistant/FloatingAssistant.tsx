"use client";

import { useAssistant } from "./AssistantContext";
import { MessageSquare, X, Sprout } from "lucide-react";
import AssistantSetup from "./AssistantSetup";
import AssistantChat from "./AssistantChat";

export function FloatingAssistant() {
  const { isOpen, openAssistant, closeAssistant, step } = useAssistant();

  if (!isOpen) {
    return (
      <button
        onClick={openAssistant}
        className="fixed bottom-6 right-6 z-[1000] bg-[#16a34a] hover:bg-[#15803d] text-white p-4 rounded-full shadow-2xl flex items-center gap-2 group transition-all duration-300"
        title="SalinO-Crop Assistant"
      >
        <Sprout className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold px-1">
          Ask AI Assistant
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-[1000] w-full sm:w-[400px] h-[90vh] sm:h-[650px] max-h-screen bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slide-in">
      {/* Header */}
      <div className="bg-[#16a34a] text-white p-4 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm leading-tight">SalinO-Crop Assistant</h3>
            <p className="text-[10px] font-semibold text-green-100">AI Context-Aware Advisor</p>
          </div>
        </div>
        <button 
          onClick={closeAssistant}
          className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden relative bg-[#f4f7fb]">
        {step === "chat" ? <AssistantChat /> : <AssistantSetup />}
      </div>
    </div>
  );
}
