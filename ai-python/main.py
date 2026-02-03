print("--------------------------------------------------")
print("🚀 STARTING GROQ-ONLY FINAL EDITION (Crisp & Technical)")
print("--------------------------------------------------")

import uvicorn
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import PyPDF2
import io
import json
import os
import logging
from typing import Optional
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

# ============================================
# CONFIGURATION
# ============================================

GROQ_ANALYSIS_KEY = os.getenv("GROQ_ANALYSIS_KEY") or os.getenv("GROQ_API_KEY")
GROQ_CHAT_KEY = os.getenv("GROQ_CHAT_KEY") or os.getenv("GROQ_API_KEY")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="CareerArchitect AI - Final", version="12.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# HELPER FUNCTIONS
# ============================================

def extract_text_from_pdf(file_content: bytes) -> str:
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        text = "\n".join([page.extract_text() for page in pdf_reader.pages])
        return text.strip()
    except Exception as e:
        logger.error(f"PDF Error: {e}")
        return ""

def clean_json_response(text: str):
    try:
        if "```" in text:
            text = text.replace("```json", "").replace("```", "")
        
        start = text.find('{')
        end = text.rfind('}')
        
        if start == -1 or end == -1: 
            return {"status": "error", "message": "No JSON found in AI response"}
            
        return json.loads(text[start:end+1])
    except Exception as e:
        logger.error(f"JSON Parse Error: {e}")
        return {"status": "error", "message": "Invalid JSON format"}

# ============================================
# ENDPOINT 1: ANALYZE (Crisp & Technical)
# ============================================

@app.post("/analyze")
async def analyze(file: UploadFile = File(...), jd: Optional[str] = Form(None)):
    
    if not GROQ_ANALYSIS_KEY:
        return JSONResponse(status_code=503, content={"status": "error", "message": "GROQ_ANALYSIS_KEY missing"})

    try:
        content = await file.read()
        text = extract_text_from_pdf(content)
        if not text:
            return JSONResponse(status_code=400, content={"status": "error", "message": "Empty or unreadable PDF"})

        client = Groq(api_key=GROQ_ANALYSIS_KEY)
        
        # === THE FINAL PROMPT ===
        prompt = """
        You are a Senior Technical Recruiter at Google. Analyze this resume.
        
        CRITICAL RULES:
        1. **Strict Types:** Recommend exactly 3 projects:
           - "Gap Filler" (Fixes a missing skill).
           - "Strength Builder" (Enhances their best skill).
           - "Showstopper" (A complex 'Wow' project).
        2. **Brevity:** "Description" must be CRISP (Max 2 sentences). No fluff.
        3. **Levels:** Use ONLY these levels: "Entry Level", "Interview Ready", "Mid-Level", "Senior".
        4. **Hard Skills Only:** In the Radar Chart, do NOT use soft skills like "Communication". Use "Architecture" instead.

        REQUIRED JSON STRUCTURE:
        {
          "status": "success",
          "candidate_profile": {
            "name": "Candidate Name",
            "total_score": 0-100,
            "market_fit_level": "Entry Level" | "Interview Ready" | "Mid-Level",
            "current_skills": ["Skill1", "Skill2", "Skill3"],
            "missing_skills": ["Critical Gap 1", "Critical Gap 2"]
          },
          "radar_chart_data": [
            {"skill": "Problem Solving", "userScore": 75, "marketScore": 90},
            {"skill": "System Design", "userScore": 60, "marketScore": 85},
            {"skill": "Architecture", "userScore": 50, "marketScore": 80},
            {"skill": "Technical Depth", "userScore": 80, "marketScore": 95},
            {"skill": "Cloud & DevOps", "userScore": 40, "marketScore": 85}
          ],
          "recommended_projects": [
            {
              "type": "Gap Filler",
              "title": "Project Title",
              "tagline": "Short tagline",
              "description": "CRISP 2-sentence technical summary. Focus on the 'Why' and the 'How'.",
              "system_architecture": "Concise tech breakdown: 'Uses Microservices with Kafka for streaming...'",
              "tech_stack": [
                {"name": "Tech1", "usage": "Usage", "icon": "React"},
                {"name": "Tech2", "usage": "Usage", "icon": "Python"}
              ],
              "learning_milestones": [
                {"week": 1, "task": "Task..."},
                {"week": 2, "task": "Task..."}
              ],
              "mock_interview_questions": [
                "Technical Question 1?",
                "Technical Question 2?",
                "Technical Question 3?",
                "Technical Question 4?",
                "Technical Question 5?"
              ]
            }
          ]
        }

        RESUME TEXT:
        """ + text[:7000]

        logger.info("⏳ Sending Final Prompt to Groq...")
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a JSON-only API. Output strict JSON. Be crisp and technical."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3, 
            max_tokens=6000,
            response_format={"type": "json_object"}
        )
        
        raw_response = completion.choices[0].message.content
        result = clean_json_response(raw_response)
        
        logger.info("✅ Analysis Complete")
        return JSONResponse(content=result)

    except Exception as e:
        logger.error(f"❌ Analysis Error: {e}")
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

# ============================================
# ENDPOINT 2: CHAT
# ============================================

class ChatRequest(BaseModel):
    user_message: str
    chat_history: list = []
    context: dict 

@app.post("/chat-with-mentor")
async def chat_with_mentor(request: ChatRequest):
    if not GROQ_CHAT_KEY: return {"reply": "Chat Service Unavailable (Key Missing)"}
    try:
        client = Groq(api_key=GROQ_CHAT_KEY)
        name = request.context.get("candidate_profile", {}).get("name", "User")
        
        system_prompt = f"""
        You are a supportive Career Mentor for {name}.
        Keep answers short and actionable.
        """
        
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(request.chat_history[-5:])
        messages.append({"role": "user", "content": request.user_message})

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )
        return {"reply": completion.choices[0].message.content}
    except Exception as e:
        return {"reply": "I'm having trouble connecting right now."}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)