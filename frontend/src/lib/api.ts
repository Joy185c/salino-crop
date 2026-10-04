/**
 * SalinO-Crop — API Client
 * Type-safe wrapper around the FastAPI backend.
 * Never exposes raw errors to the user.
 */
import axios, { AxiosError } from "axios";
import type {
  AdvisoryData,
  District,
  ForecastData,
  GroundMeasurement,
  GroundMeasurementCreate,
  HealthData,
  Plot,
  RecommendationData,
  SalinityData,
  Upazila,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Error handling ────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public detail?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function handleError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const e = error as AxiosError<{ detail?: string }>;
    const status = e.response?.status ?? 0;
    const detail = e.response?.data?.detail;

    if (status === 404) throw new ApiError(404, "Data not found", detail);
    if (status === 422) throw new ApiError(422, "Validation error", detail);
    if (status >= 500) throw new ApiError(status, "Service temporarily unavailable", detail);
    throw new ApiError(status, e.message, detail);
  }
  throw new ApiError(0, "Network error — check your connection");
}

// ─── Health ────────────────────────────────────────────────────────────────────

export async function getHealth(): Promise<HealthData> {
  try {
    const { data } = await api.get<HealthData>("/api/health");
    return data;
  } catch (e) {
    handleError(e);
  }
}

// ─── Geography ────────────────────────────────────────────────────────────────

export async function getDistricts(coastalOnly = false): Promise<District[]> {
  try {
    const { data } = await api.get<District[]>("/api/districts", {
      params: { coastal_only: coastalOnly },
    });
    return data;
  } catch (e) {
    handleError(e);
  }
}

export async function getUpazilas(districtCode?: string): Promise<Upazila[]> {
  try {
    if (districtCode) {
      const { data } = await api.get<Upazila[]>(`/api/districts/${districtCode}/upazilas`);
      return data;
    }
    const { data } = await api.get<Upazila[]>("/api/upazilas");
    return data;
  } catch (e) {
    handleError(e);
  }
}

// ─── Plots ────────────────────────────────────────────────────────────────────

export async function getPlots(params?: {
  district_id?: number;
  demo_only?: boolean;
  limit?: number;
}): Promise<Plot[]> {
  try {
    const { data } = await api.get<Plot[]>("/api/plots", { params });
    return data;
  } catch (e) {
    handleError(e);
  }
}

export async function getPlot(id: string): Promise<Plot> {
  try {
    const { data } = await api.get<Plot>(`/api/plots/${id}`);
    return data;
  } catch (e) {
    handleError(e);
  }
}

export async function getPlotSalinity(id: string): Promise<SalinityData> {
  try {
    const { data } = await api.get<SalinityData>(`/api/plots/${id}/salinity`);
    return data;
  } catch (e) {
    handleError(e);
  }
}

export async function getPlotForecast(id: string): Promise<ForecastData> {
  try {
    const { data } = await api.get<ForecastData>(`/api/plots/${id}/forecast`);
    return data;
  } catch (e) {
    handleError(e);
  }
}

export async function getPlotRecommendations(
  id: string,
  season?: string
): Promise<RecommendationData> {
  try {
    const { data } = await api.get<RecommendationData>(
      `/api/plots/${id}/recommendations`,
      { params: season ? { season } : {} }
    );
    return data;
  } catch (e) {
    handleError(e);
  }
}

// ─── Advisory ─────────────────────────────────────────────────────────────────

export async function generateAdvisory(plotId: string): Promise<AdvisoryData> {
  try {
    const { data } = await api.post<AdvisoryData>("/api/advisory/generate", {
      plot_id: plotId,
    });
    return data;
  } catch (e) {
    handleError(e);
  }
}

export async function generateVoice(textBn: string): Promise<{ audio_url: string; provider: string }> {
  try {
    const { data } = await api.post("/api/voice/generate", {
      text_bn: textBn,
      voice_name: "bn-BD-Standard-A",
      speaking_rate: 0.9,
    });
    return data;
  } catch (e) {
    handleError(e);
  }
}

// ─── Validation ────────────────────────────────────────────────────────────────

export async function submitMeasurement(
  payload: GroundMeasurementCreate
): Promise<GroundMeasurement> {
  try {
    const { data } = await api.post<GroundMeasurement>(
      "/api/validation/measurements",
      payload
    );
    return data;
  } catch (e) {
    handleError(e);
  }
}

export async function getMeasurements(plotId?: string): Promise<GroundMeasurement[]> {
  try {
    const { data } = await api.get<GroundMeasurement[]>("/api/validation/measurements", {
      params: plotId ? { plot_id: plotId } : {},
    });
    return data;
  } catch (e) {
    handleError(e);
  }
}

// ─── Map data ─────────────────────────────────────────────────────────────────

export async function getSalinityMapData(districtCode?: string): Promise<any> {
  try {
    const { data } = await api.get("/api/map/salinity", {
      params: districtCode ? { district_code: districtCode } : {},
    });
    return data;
  } catch (e) {
    handleError(e);
  }
}

export async function getForecastMapData(horizonDays: 30 | 60 | 90 = 30): Promise<any> {
  try {
    const { data } = await api.get("/api/map/forecast", {
      params: { horizon_days: horizonDays },
    });
    return data;
  } catch (e) {
    handleError(e);
  }
}
