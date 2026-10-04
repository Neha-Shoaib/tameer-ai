import uuid
from typing import Union
from app.models.schemas import Requirements, EstimateResponse, AgentTrace
from app.agents.voice_agent import extract_requirements
from app.agents.boq_agent import generate_boq
from app.agents.pricing_agent import calculate_costs
from app.agents.timeline_agent import generate_timeline_and_tips

def run_pipeline(input_data: Union[str, Requirements]) -> EstimateResponse:
    traces = []
    
    # 1. Extraction
    if isinstance(input_data, str):
        req, trace1 = extract_requirements(input_data)
        traces.append(AgentTrace(**trace1))
    else:
        req = input_data
        traces.append(AgentTrace(agent_name="Requirement & Voice Agent", status="success", duration_ms=10, summary="Received structured input directly"))

    # 2. BOQ Generation
    boq, covered_area, trace2 = generate_boq(req)
    traces.append(AgentTrace(**trace2))
    
    # 3. Cost Calculation
    costs, summary, trace3 = calculate_costs(boq, covered_area, req.quality_tier)
    traces.append(AgentTrace(**trace3))
    
    # 4. Timeline
    timeline, tips, trace4 = generate_timeline_and_tips(req, covered_area)
    traces.append(AgentTrace(**trace4))
    
    return EstimateResponse(
        id=str(uuid.uuid4()),
        requirements=req,
        boq=costs,
        cost_summary=summary,
        timeline=timeline,
        tips=tips,
        agent_trace=traces
    )
