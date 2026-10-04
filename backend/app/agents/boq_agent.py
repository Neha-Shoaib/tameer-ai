import json
import os
import time
from typing import List, Tuple, Dict, Any
from app.models.schemas import Requirements, BOQItem

def load_coefficients() -> dict:
    file_path = os.path.join(os.path.dirname(__file__), "..", "data", "coefficients.json")
    with open(file_path, "r") as f:
        return json.load(f)

def calculate_covered_area(req: Requirements, coeffs: dict) -> float:
    # Convert everything to sq_ft
    sqft = req.plot_size
    if req.plot_unit == "gaz": sqft *= 9.0
    elif req.plot_unit == "marla": sqft *= 272.25
    elif req.plot_unit == "kanal": sqft *= 5445.0
    
    # Coverage ratio
    ratio = coeffs["coverage_ratio_small"] if sqft <= coeffs["small_plot_threshold_sqft"] else coeffs["coverage_ratio_large"]
    
    return float(sqft * ratio * req.floors)

def generate_boq(req: Requirements) -> Tuple[List[BOQItem], float, Dict[str, Any]]:
    start_time = time.time()
    coeffs = load_coefficients()
    covered_area = calculate_covered_area(req, coeffs)
    wastage = coeffs["wastage_factor"]
    
    boq: List[BOQItem] = []
    
    # --- Grey Structure ---
    c_grey = coeffs["grey_structure"]
    boq.append(BOQItem(category="grey_structure", item="cement", unit="bags", 
                       quantity=round(covered_area * c_grey["cement_bags_per_sqft"] * wastage), 
                       notes="Includes foundation, columns, roof slab, and plaster."))
    
    boq.append(BOQItem(category="grey_structure", item="steel", unit="kg", 
                       quantity=round(covered_area * c_grey["steel_kg_per_sqft"] * wastage), 
                       notes="Grade 60 steel for RCC structures."))
    
    boq.append(BOQItem(category="grey_structure", item="bricks", unit="pieces", 
                       quantity=round(covered_area * c_grey["bricks_per_sqft"] * wastage), 
                       notes="Awal grade bricks for inner and outer walls."))
    
    boq.append(BOQItem(category="grey_structure", item="sand", unit="cft", 
                       quantity=round(covered_area * c_grey["sand_cft_per_sqft"] * wastage), 
                       notes="River sand for mortar and plaster."))
    
    boq.append(BOQItem(category="grey_structure", item="crush", unit="cft", 
                       quantity=round(covered_area * c_grey["crush_cft_per_sqft"] * wastage), 
                       notes="Margalla/Sargodha crush for concrete."))

    # --- Finishing ---
    c_fin = coeffs["finishing"]
    boq.append(BOQItem(category="finishing", item="tiles", unit="sq_ft", 
                       quantity=round(covered_area * c_fin["tiles_sqft_per_sqft"] * wastage), 
                       notes="Floor and washroom tiling."))
    
    boq.append(BOQItem(category="finishing", item="paint", unit="liters", 
                       quantity=round(covered_area * c_fin["paint_liters_per_sqft"] * wastage), 
                       notes="Internal emulsion and external weather shield."))
    
    total_rooms = req.bedrooms + req.kitchens + req.bathrooms
    boq.append(BOQItem(category="finishing", item="doors", unit="unit", 
                       quantity=round(total_rooms * c_fin["doors_per_room"]), 
                       notes="Wooden doors including frames."))
    
    boq.append(BOQItem(category="finishing", item="windows", unit="unit", 
                       quantity=round(total_rooms * c_fin["windows_per_room"]), 
                       notes="Aluminum sliding windows."))

    # --- Services ---
    c_srv = coeffs["services"]
    boq.append(BOQItem(category="services", item="electrical", unit="points", 
                       quantity=round(covered_area * c_srv["electrical_points_per_sqft"]), 
                       notes="Wiring, switchboards, and light points."))
    
    boq.append(BOQItem(category="services", item="plumbing", unit="points", 
                       quantity=round(req.bathrooms * c_srv["plumbing_points_per_bathroom"] + req.kitchens * 3), 
                       notes="PPRC/UPVC pipes and sanitary fixtures."))

    # --- Labor ---
    boq.append(BOQItem(category="labor", item="labor_grey", unit="sq_ft", quantity=round(covered_area), notes="Contractor labor for grey structure"))
    boq.append(BOQItem(category="labor", item="labor_finishing", unit="sq_ft", quantity=round(covered_area), notes="Contractor labor for finishing works"))

    duration = int((time.time() - start_time) * 1000)
    trace = {"agent_name": "Estimation & BOQ Agent", "status": "success", "duration_ms": duration, "summary": f"Calculated quantities for {round(covered_area)} sq ft covered area"}
    
    return boq, covered_area, trace
