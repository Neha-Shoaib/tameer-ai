import os
import re
import json
import time
from groq import Groq
from app.models.schemas import Requirements
from typing import Tuple, Dict, Any

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY", "fallback"))

def transcribe_audio(audio_bytes: bytes, filename: str) -> str:
    if os.getenv("GROQ_API_KEY") in [None, "", "fallback"]:
        return "Audio transcription unavailable. Please type your requirements."
    
    # Save temporarily to feed to Groq
    temp_path = f"/tmp/{filename}"
    try:
        with open(temp_path, "wb") as f:
            f.write(audio_bytes)
        
        with open(temp_path, "rb") as file:
            transcription = groq_client.audio.transcriptions.create(
                file=(filename, file.read()),
                model="whisper-large-v3",
                prompt="Pakistani construction context: gaz, marla, thekedar, bajri, sariya, ground plus one, washroom, kamray.",
                language="ur"
            )
        return transcription.text
    except Exception as e:
        print(f"Transcription error: {e}")
        return ""
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

def extract_requirements(text: str) -> Tuple[Requirements, Dict[str, Any]]:
    start_time = time.time()
    
    system_prompt = """
    You are an expert civil engineering assistant for Pakistan.
    Extract construction requirements from the user's text into JSON.
    Expected JSON schema matching this exact structure:
    {
        "plot_size": float,
        "plot_unit": "gaz" | "sq_ft" | "marla" | "kanal",
        "floors": integer (ground plus one = 2, double story = 2, single story = 1),
        "bedrooms": integer,
        "bathrooms": integer,
        "kitchens": integer,
        "quality_tier": "economy" | "standard" | "premium",
        "project_type": "new_construction" | "renovation",
        "city": string,
        "assumptions": [array of strings explaining defaults you guessed]
    }
    If a value is not mentioned, make a sensible guess for a Pakistani home and add it to assumptions.
    Output ONLY valid JSON.
    """

    try:
        if os.getenv("GROQ_API_KEY") not in [None, "", "fallback"]:
            completion = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": text}
                ],
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            data = json.loads(completion.choices[0].message.content)
            req = Requirements(**data)
            duration = int((time.time() - start_time) * 1000)
            return req, {"agent_name": "Requirement & Voice Agent", "status": "success", "duration_ms": duration, "summary": "LLM extracted requirements"}
    except Exception as e:
        print(f"LLM extraction failed: {e}. Falling back to regex.")

    # Regex Fallback
    req = regex_fallback_parser(text)
    duration = int((time.time() - start_time) * 1000)
    return req, {"agent_name": "Requirement & Voice Agent", "status": "fallback", "duration_ms": duration, "summary": "Regex fallback used due to LLM error"}

def regex_fallback_parser(text: str) -> Requirements:
    text = text.lower()
    plot_size = 120.0
    plot_unit = "gaz"
    floors = 2
    
    # Plot size
    size_match = re.search(r'(\d+)\s*(gaz|marla|kanal|sq\s*ft|square yards)', text)
    if size_match:
        plot_size = float(size_match.group(1))
        unit_str = size_match.group(2)
        if "marla" in unit_str: plot_unit = "marla"
        elif "kanal" in unit_str: plot_unit = "kanal"
        elif "sq" in unit_str: plot_unit = "sq_ft"
        else: plot_unit = "gaz"

    # Floors
    if "ground plus one" in text or "double" in text or "2 floor" in text:
        floors = 2
    elif "ground plus two" in text or "3 floor" in text:
        floors = 3
    elif "single" in text or "1 floor" in text or "only ground" in text:
        floors = 1
        
    beds = len(re.findall(r'bed|kamray|room', text)) or 3
    baths = len(re.findall(r'bath|washroom', text)) or 3
    
    return Requirements(
        plot_size=plot_size,
        plot_unit=plot_unit,
        floors=floors,
        bedrooms=beds,
        bathrooms=baths,
        assumptions=["Used keyword detection (fallback) to guess missing parameters."]
    )
