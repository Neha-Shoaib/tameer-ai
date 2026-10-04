// Type definitions matching Backend Pydantic Schemas exactly
export interface Requirements {
  plot_size: number;
  plot_unit: "gaz" | "sq_ft" | "marla" | "kanal";
  floors: number;
  bedrooms: number;
  bathrooms: number;
  kitchens: number;
  quality_tier: "economy" | "standard" | "premium";
  project_type: "new_construction" | "renovation";
  city: string;
  assumptions: string[];
}

export interface CostEstimateItem {
  category: "grey_structure" | "finishing" | "services" | "labor" | "contingency";
  item: string;
  unit: string;
  quantity: number;
  notes: string;
  rate_pkr: number;
  amount_pkr: number;
}

export interface CostSummary {
  grey_structure_total: number;
  finishing_total: number;
  services_total: number;
  labor_total: number;
  contingency_total: number;
  grand_total: number;
  cost_per_sqft: number;
  covered_area_sqft: number;
  percentage_split: Record<string, number>;
}

export interface TimelinePhase {
  name: string;
  start_week: number;
  duration_weeks: number;
  depends_on: string | null;
  payment_milestone_percent: number;
  checklist: string[];
}

export interface AgentTrace {
  agent_name: string;
  status: "success" | "error" | "fallback";
  duration_ms: number;
  summary: string;
}

export interface EstimateResponse {
  id: string;
  requirements: Requirements;
  boq: CostEstimateItem[];
  cost_summary: CostSummary;
  timeline: TimelinePhase[];
  tips: string[];
  agent_trace: AgentTrace[];
}

export interface MaterialRate {
  material_key: string;
  name: string;
  unit: string;
  rate_pkr: number;
  city: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = {
  async transcribeAudio(file: Blob): Promise<{ text: string }> {
    const formData = new FormData();
    formData.append("file", file, "audio.webm");
    const res = await fetch(`${API_BASE}/api/transcribe`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Transcription failed");
    return res.json();
  },

  async runPipelineText(text: string): Promise<EstimateResponse> {
    const res = await fetch(`${API_BASE}/api/pipeline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error("Estimation pipeline failed");
    return res.json();
  },

  async runPipelineRequirements(req: Requirements): Promise<EstimateResponse> {
    const res = await fetch(`${API_BASE}/api/estimate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error("Estimation recalculation failed");
    return res.json();
  },

  async getRates(): Promise<MaterialRate[]> {
    const res = await fetch(`${API_BASE}/api/rates`);
    if (!res.ok) throw new Error("Failed to fetch rates");
    return res.json();
  },

  async updateRate(material_key: string, rate_pkr: number): Promise<void> {
    const res = await fetch(`${API_BASE}/api/rates/${material_key}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rate_pkr }),
    });
    if (!res.ok) throw new Error("Failed to update rate");
  }
};
