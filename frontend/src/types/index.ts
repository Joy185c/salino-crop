/**
 * SalinO-Crop — Shared TypeScript Types
 * These mirror the backend Pydantic schemas.
 */

export type RiskLevel = "low" | "moderate" | "high" | "very_high" | "unknown";
export type QualityFlag = "good" | "suspect" | "low_confidence" | "missing";
export type ModelMode = "REAL" | "DEMO" | "BASELINE" | "EXPERIMENTAL";
export type Season = "aman" | "boro" | "aus" | "rabi" | "year_round";

// ─── Geography ────────────────────────────────────────────────────────────────

export interface District {
  id: number;
  name: string;
  name_bn: string;
  code: string;
  division: string;
  is_coastal: boolean;
}

export interface Upazila {
  id: number;
  name: string;
  name_bn: string;
  code: string;
  district_id: number;
}

// ─── Plots ────────────────────────────────────────────────────────────────────

export interface Plot {
  id: string;
  name: string;
  district_id: number;
  upazila_id: number | null;
  area_ha: number | null;
  farmer_name: string | null;
  is_demo: boolean;
  created_at: string;
}

// ─── Salinity ─────────────────────────────────────────────────────────────────

export interface SalinityData {
  plot_id: string;
  ec_ds_m: number | null;
  ndsi: number | null;
  confidence: number | null;
  risk_level: RiskLevel;
  model_version: string;
  model_mode: ModelMode;
  quality_flag: QualityFlag;
  predicted_at: string;
  warning: string | null;
  is_demo: boolean;
}

// ─── Forecast ─────────────────────────────────────────────────────────────────

export interface ForecastData {
  plot_id: string;
  ec_30d: number | null;
  ec_60d: number | null;
  ec_90d: number | null;
  confidence_30d: number | null;
  confidence_60d: number | null;
  confidence_90d: number | null;
  risk_30d: RiskLevel;
  risk_60d: RiskLevel;
  risk_90d: RiskLevel;
  model_version: string;
  model_mode: ModelMode;
  quality_flag: QualityFlag;
  generated_at: string;
  warning: string | null;
  is_demo: boolean;
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export interface CropRank {
  crop_variety_id: number;
  crop_name: string;
  crop_name_bn: string;
  variety: string;
  variety_bn: string;
  max_ec_ds_m: number;
  tolerance_category: string;
  season: Season;
  score: number;
  reason_codes: string[];
  is_halophyte: boolean;
}

export interface RecommendationData {
  plot_id: string;
  risk_level: RiskLevel;
  predicted_ec_30d: number | null;
  predicted_ec_60d: number | null;
  predicted_ec_90d: number | null;
  season: Season | null;
  recommended: CropRank[];
  warning: string | null;
}

// ─── Advisory ─────────────────────────────────────────────────────────────────

export interface AdvisoryData {
  plot_id: string;
  advisory_bn: string;
  sms_text_bn: string;
  voice_script_bn: string;
  officer_summary_en: string;
  audio_url: string | null;
  llm_provider: string;
  llm_model: string;
  generated_at: string;
  is_demo: boolean;
  warning: string | null;
}

// ─── Ground Validation ────────────────────────────────────────────────────────

export interface GroundMeasurementCreate {
  plot_id?: string;
  measured_at: string;
  latitude: number;
  longitude: number;
  ec_ds_m: number;
  soil_depth_cm?: number;
  measurement_method?: string;
  notes?: string;
  officer_name?: string;
  officer_id_number?: string;
}

export interface GroundMeasurement {
  id: string;
  plot_id: string | null;
  measured_at: string;
  submitted_at: string;
  latitude: number;
  longitude: number;
  ec_ds_m: number;
  soil_depth_cm: number | null;
  officer_name: string | null;
  quality_reviewed: boolean;
  approved_for_calibration: boolean;
}

// ─── Health ───────────────────────────────────────────────────────────────────

export interface HealthData {
  status: string;
  version: string;
  app_env: string;
  demo_mode: boolean;
  database: string;
  timestamp: string;
  components: Record<string, string>;
}
