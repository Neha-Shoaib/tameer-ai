from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class Requirements(BaseModel):
    plot_size: float = Field(default=120.0, description="Size of the plot")
    plot_unit: Literal["gaz", "sq_ft", "marla", "kanal"] = Field(default="gaz")
    floors: int = Field(default=2, description="Number of floors (e.g., ground+1 = 2)")
    bedrooms: int = Field(default=3)
    bathrooms: int = Field(default=3)
    kitchens: int = Field(default=1)
    quality_tier: Literal["economy", "standard", "premium"] = Field(default="standard")
    project_type: Literal["new_construction", "renovation"] = Field(default="new_construction")
    city: str = Field(default="Karachi")
    assumptions: List[str] = Field(default_factory=list)

class BOQItem(BaseModel):
    category: Literal["grey_structure", "finishing", "services", "labor", "contingency"]
    item: str
    unit: str
    quantity: float
    notes: str

class CostEstimateItem(BOQItem):
    rate_pkr: float
    amount_pkr: float

class CostSummary(BaseModel):
    grey_structure_total: float
    finishing_total: float
    services_total: float
    labor_total: float
    contingency_total: float
    grand_total: float
    cost_per_sqft: float
    covered_area_sqft: float
    percentage_split: dict[str, float]

class TimelinePhase(BaseModel):
    name: str
    start_week: int
    duration_weeks: int
    depends_on: Optional[str] = None
    payment_milestone_percent: float
    checklist: List[str]

class AgentTrace(BaseModel):
    agent_name: str
    status: Literal["success", "error", "fallback"]
    duration_ms: int
    summary: str

class EstimateResponse(BaseModel):
    id: str
    requirements: Requirements
    boq: List[CostEstimateItem]
    cost_summary: CostSummary
    timeline: List[TimelinePhase]
    tips: List[str]
    agent_trace: List[AgentTrace]
