export interface FarmerContext {
  farmer: {
    name: string;
    role: string;
    phone: string;
  };
  location: {
    district: string;
    upazila: string;
    union: string;
  };
  plot: {
    plotId: string;
    area: string;
    areaUnit: "acre" | "decimal" | "hectare";
    soilType: string;
    currentCrop: string;
  };
  intent: {
    topics: string[];
    otherIntent: string;
  };
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  hasAudio?: boolean;
  scientificData?: {
    ec?: number;
    risk?: string;
    forecast?: { d30: number; d60: number; d90: number };
  };
  cropRecommendation?: Array<{ name: string; suitability: string }>;
}
