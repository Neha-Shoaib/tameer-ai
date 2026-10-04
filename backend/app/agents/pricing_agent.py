import json
import os
import time
from typing import List, Tuple, Dict, Any
from app.models.schemas import BOQItem, CostEstimateItem, CostSummary
from app.utils.db import get_supabase_client

def load_default_rates() -> dict:
    file_path = os.path.join(os.path.dirname(__file__), "..", "data", "default_rates.json")
    with open(file_path, "r") as f:
        return json.load(f)

def fetch_rates() -> dict:
    # Try supabase first
    supabase = get_supabase_client()
    if supabase:
        try:
            res = supabase.table("material_rates").select("*").execute()
            if res.data:
                # Convert list to dict mapping
                return {item["material_key"]: item for item in res.data}
        except Exception as e:
            print(f"Supabase fetch failed: {e}")
    
    # Fallback
    return load_default_rates()

def calculate_costs(boq: List[BOQItem], covered_area: float, quality_tier: str) -> Tuple[List[CostEstimateItem], CostSummary, Dict[str, Any]]:
    start_time = time.time()
    rates_db = fetch_rates()
    
    # Multipliers based on tier
    tier_multiplier = {"economy": 0.85, "standard": 1.0, "premium": 1.4}
    mt = tier_multiplier.get(quality_tier, 1.0)

    cost_items: List[CostEstimateItem] = []
    totals = {"grey_structure": 0.0, "finishing": 0.0, "services": 0.0, "labor": 0.0, "contingency": 0.0}

    for item in boq:
        rate_info = rates_db.get(item.item, {"rate_pkr": 0})
        base_rate = float(rate_info.get("rate_pkr", 0))
        
        # Apply tier multiplier to finishing and services, not to basic grey materials
        rate = base_rate * mt if item.category in ["finishing", "services"] else base_rate
        amount = item.quantity * rate
        
        cost_items.append(CostEstimateItem(
            category=item.category,
            item=item.item,
            unit=item.unit,
            quantity=item.quantity,
            notes=item.notes,
            rate_pkr=rate,
            amount_pkr=amount
        ))
        
        if item.category in totals:
            totals[item.category] += amount

    # Contingency (8% of everything else)
    subtotal = totals["grey_structure"] + totals["finishing"] + totals["services"] + totals["labor"]
    contingency = subtotal * 0.08
    totals["contingency"] = contingency
    
    cost_items.append(CostEstimateItem(
        category="contingency", item="unforeseen", unit="lump_sum", quantity=1, notes="8% safety buffer", rate_pkr=contingency, amount_pkr=contingency
    ))
    
    grand_total = subtotal + contingency
    cost_per_sqft = grand_total / covered_area if covered_area > 0 else 0
    
    split = {
        "Grey Structure": round((totals["grey_structure"]/grand_total)*100, 1),
        "Finishing": round((totals["finishing"]/grand_total)*100, 1),
        "Services": round((totals["services"]/grand_total)*100, 1),
        "Labor": round((totals["labor"]/grand_total)*100, 1),
        "Contingency": round((contingency/grand_total)*100, 1)
    }

    summary = CostSummary(
        grey_structure_total=totals["grey_structure"],
        finishing_total=totals["finishing"],
        services_total=totals["services"],
        labor_total=totals["labor"],
        contingency_total=contingency,
        grand_total=grand_total,
        cost_per_sqft=cost_per_sqft,
        covered_area_sqft=covered_area,
        percentage_split=split
    )

    duration = int((time.time() - start_time) * 1000)
    trace = {"agent_name": "Market Pricing Agent", "status": "success", "duration_ms": duration, "summary": "Applied local market rates"}
    
    return cost_items, summary, trace
