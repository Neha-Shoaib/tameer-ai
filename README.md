# Tameer.ai 🏗️

> **Hackathon 2024:** "Build Intelligent Agents to Reshape the Future, Unlock Potential & Drive Innovation"

Tameer.ai is an Autonomous Construction & Renovation Estimator designed for the Pakistani market. It acts as a personal AI Civil Engineer and Quantity Surveyor to prevent middle-class homeowners from being overcharged by local contractors (*thekedars*) and suppliers. 

Users can speak their requirements in Urdu, Roman Urdu, or English, and a pipeline of deterministic engineering agents calculates a highly accurate Bill of Quantities (BOQ), local market cost breakdown, and a construction timeline.

---

## 📖 The Story / Problem Statement
Building a 120 *gaz* (square yards) house in Pakistan is a daunting task. Homeowners rarely know how many cement bags, tons of steel, or bricks they need. They rely on contractor estimates, which are often inflated. Tameer.ai solves this by using AI to understand human requirements and routing them through strict, deterministic engineering formulas based on local standards, completely removing the "guesswork" and empowering the homeowner.

## 🏗️ Architecture & AI Agent Pipeline

```mermaid
graph TD
    User([User Voice/Text Input]) --> UI[Next.js Frontend]
    UI -->|Audio Blob| Whisper[Groq: Whisper-Large-v3]
    Whisper -->|Urdu/English Text| UI
    
    UI -->|Requirements Text| FastAPI[FastAPI Backend / Orchestrator]
    
    FastAPI --> Agent1[1. Voice & Requirement Agent]
    Agent1 -->|Llama 3.3 70B JSON Extraction| Req[Structured Requirements]
    
    Req --> Agent2[2. Estimation & BOQ Agent]
    Agent2 -->|Deterministic Python Formulas| BOQ[Bill of Quantities]
    
    BOQ --> Agent3[3. Market Pricing Agent]
    Agent3 -->|Supabase Live Rates| Costs[Cost Breakdown & KPIs]
    
    Costs --> Agent4[4. Timeline & Milestone Agent]
    Agent4 -->|Phase Logic + LLM Tips| Timeline[Gantt Schedule & Tips]
    
    Timeline --> API_Res[JSON API Response]
    API_Res --> UI_Dashboard[Interactive Dashboard & PDF Report] 
