from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
from dotenv import load_dotenv

from app.models.schemas import Requirements, EstimateResponse
from app.agents.voice_agent import transcribe_audio
from app.agents.orchestrator import run_pipeline
from app.utils.db import get_supabase_client

load_dotenv()

app = FastAPI(title="Tameer.ai API")

# Setup CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextPayload(BaseModel):
    text: str

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Tameer.ai backend is running."}

@app.post("/api/transcribe")
async def api_transcribe(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        text = transcribe_audio(contents, file.filename)
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/pipeline", response_model=EstimateResponse)
def api_pipeline(payload: TextPayload):
    try:
        response = run_pipeline(payload.text)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/estimate", response_model=EstimateResponse)
def api_estimate(req: Requirements):
    try:
        response = run_pipeline(req)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/rates")
def api_get_rates():
    # Attempt DB first
    supabase = get_supabase_client()
    if supabase:
        res = supabase.table("material_rates").select("*").execute()
        if res.data:
            return res.data
            
    # Fallback
    file_path = os.path.join(os.path.dirname(__file__), "data", "default_rates.json")
    with open(file_path, "r") as f:
        data = json.load(f)
        return [{"material_key": k, **v} for k, v in data.items()]

@app.put("/api/rates/{material_key}")
def api_update_rate(material_key: str, payload: dict):
    new_rate = payload.get("rate_pkr")
    if not new_rate:
        raise HTTPException(status_code=400, detail="rate_pkr is required")
        
    supabase = get_supabase_client()
    if supabase:
        try:
            res = supabase.table("material_rates").update({"rate_pkr": new_rate}).eq("material_key", material_key).execute()
            return {"status": "success", "data": res.data}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        # For free tier MVP without DB, we just simulate success (client uses localStorage as secondary cache ideally, or just refetches)
        return {"status": "simulated_success", "note": "No DB connected"}
