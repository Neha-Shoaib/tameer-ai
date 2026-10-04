import os
import time
from typing import List, Tuple, Dict, Any
from app.models.schemas import Requirements, TimelinePhase
from groq import Groq

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY", "fallback"))

def generate_timeline_and_tips(req: Requirements, covered_area: float) -> Tuple[List[TimelinePhase], List[str], Dict[str, Any]]:
    start_time = time.time()
    
    # Base schedule scale
    base_weeks = 4 * req.floors
    if covered_area > 2000:
        base_weeks += 4
        
    phases = [
        TimelinePhase(name="Site Prep & Foundation", start_week=1, duration_weeks=2, payment_milestone_percent=15.0, checklist=["Check plot demarcations", "Ensure excavation depth matches drawings", "Verify termite proofing"]),
        TimelinePhase(name="Plinth & DPC", start_week=3, duration_weeks=1, depends_on="Site Prep & Foundation", payment_milestone_percent=10.0, checklist=["Check bitumen coating", "Verify DPC thickness"]),
        TimelinePhase(name="Brickwork & Columns (GF)", start_week=4, duration_weeks=base_weeks-2, depends_on="Plinth & DPC", payment_milestone_percent=20.0, checklist=["Check brick soaking", "Ensure vertical alignment (sahul)", "Curing of columns"]),
        TimelinePhase(name="Roof Slab", start_week=base_weeks+2, duration_weeks=2, depends_on="Brickwork & Columns (GF)", payment_milestone_percent=15.0, checklist=["Verify steel spacing", "Check electrical conduit layout", "Ensure 21-day curing timeline"]),
        TimelinePhase(name="Plastering & Conduits", start_week=base_weeks+4, duration_weeks=3, depends_on="Roof Slab", payment_milestone_percent=10.0, checklist=["Chicken mesh at joints", "Curing of plaster"]),
        TimelinePhase(name="Flooring & Tiling", start_week=base_weeks+7, duration_weeks=3, depends_on="Plastering & Conduits", payment_milestone_percent=15.0, checklist=["Verify slopes for water drainage in washrooms", "Check tile hollowness"]),
        TimelinePhase(name="Woodwork, Paint & Handover", start_week=base_weeks+10, duration_weeks=4, depends_on="Flooring & Tiling", payment_milestone_percent=15.0, checklist=["Primer application before paint", "Check door hinges", "Test plumbing pressure"])
    ]
    
    # Try LLM for tips
    tips = [
        "Sariya (Steel): Ensure your contractor uses Grade-60 steel and spacing matches the structural drawing.",
        "Curing (Tarai): Concrete needs 14-21 days of water curing to reach full strength. Never skip this.",
        "Seepage: Apply high-quality bitumen coating at the DPC level to prevent rising dampness."
    ]
    
    status = "success"
    if os.getenv("GROQ_API_KEY") not in [None, "", "fallback"]:
        try:
            prompt = f"Give exactly 3 short, actionable 'Thekedar Watch' tips for an owner building a {req.floors} floor house in Pakistan. Use simple English with common Urdu terms (like Tarai, Sariya). Format as a plain list without numbers."
            completion = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            raw_tips = completion.choices[0].message.content.split('\n')
            tips = [t.strip('-* ') for t in raw_tips if len(t.strip()) > 10][:3]
        except Exception as e:
            print(f"Tips generation failed: {e}")
            status = "fallback"
            
    duration = int((time.time() - start_time) * 1000)
    trace = {"agent_name": "Timeline & Advisory Agent", "status": status, "duration_ms": duration, "summary": "Generated phased schedule and milestones"}
    
    return phases, tips, trace
