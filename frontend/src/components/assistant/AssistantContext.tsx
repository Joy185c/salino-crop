"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import type { FarmerContext, ChatMessage } from "@/types/assistant";

type AssistantStep = "closed" | "setup_farmer" | "setup_location" | "setup_plot" | "setup_intent" | "setup_review" | "chat";

interface AssistantState {
  isOpen: boolean;
  step: AssistantStep;
  context: FarmerContext;
  messages: ChatMessage[];
  isLoading: boolean;
  
  openAssistant: () => void;
  closeAssistant: () => void;
  setStep: (step: AssistantStep) => void;
  updateContext: (key: keyof FarmerContext, data: any) => void;
  addMessage: (msg: ChatMessage) => void;
  setMessages: (msgs: ChatMessage[]) => void;
  setLoading: (loading: boolean) => void;
  resetContext: () => void;
}

const defaultContext: FarmerContext = {
  farmer: { name: "", role: "", phone: "" },
  location: { district: "", upazila: "", union: "" },
  plot: { plotId: "", area: "", areaUnit: "acre", soilType: "", currentCrop: "" },
  intent: { topics: [], otherIntent: "" }
};

const AssistantContext = createContext<AssistantState | undefined>(undefined);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<AssistantStep>("setup_farmer");
  const [context, setContext] = useState<FarmerContext>(defaultContext);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();
  const pathname = usePathname();

  // Auto-initialize plot ID if visiting a plot page
  useEffect(() => {
    if (pathname && pathname.startsWith("/plot/") && params?.id) {
      setContext(prev => ({
        ...prev,
        plot: { ...prev.plot, plotId: params.id as string }
      }));
    }
  }, [params, pathname]);

  const openAssistant = () => setIsOpen(true);
  const closeAssistant = () => setIsOpen(false);
  const updateContext = (key: keyof FarmerContext, data: any) => {
    setContext(prev => ({ ...prev, [key]: { ...prev[key], ...data } }));
  };
  const addMessage = (msg: ChatMessage) => setMessages(prev => [...prev, msg]);
  const resetContext = () => {
    setContext(defaultContext);
    setMessages([]);
    setStep("setup_farmer");
  };

  return (
    <AssistantContext.Provider value={{
      isOpen, step, context, messages, isLoading,
      openAssistant, closeAssistant, setStep, updateContext, 
      addMessage, setMessages, setLoading: setIsLoading, resetContext
    }}>
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant() {
  const ctx = useContext(AssistantContext);
  if (!ctx) throw new Error("useAssistant must be used within AssistantProvider");
  return ctx;
}
