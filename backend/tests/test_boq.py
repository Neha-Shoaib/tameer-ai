import pytest
from app.models.schemas import Requirements
from app.agents.boq_agent import generate_boq

def test_boq_calculation():
    req = Requirements(
        plot_size=120.0,
        plot_unit="gaz",
        floors=2,
        bedrooms=3,
        bathrooms=3,
        kitchens=1,
        quality_tier="standard"
    )
    
    boq, covered_area, trace = generate_boq(req)
    
    assert covered_area > 0
    # 120 gaz = 1080 sq ft. For <=1080 sqft, ratio is 0.75. So 1080 * 0.75 * 2 = 1620 sq ft.
    assert covered_area == 1620.0
    
    assert len(boq) > 0
    categories = set([item.category for item in boq])
    assert "grey_structure" in categories
    assert "finishing" in categories
    assert "services" in categories
    assert "labor" in categories

    # Verify cement quantity logic: 1620 * 0.42 * 1.05 = ~714 bags
    cement_item = next(item for item in boq if item.item == "cement")
    assert cement_item.quantity > 700 and cement_item.quantity < 730
    
    assert trace["status"] == "success"
