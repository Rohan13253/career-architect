print("--------------------------------------------------")
print("🚀 STARTING GROQ-ONLY: MAX CONTENT EDITION")
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

GROQ_ANALYSIS_KEY = os.getenv("GROQ_ANALYSIS_KEY") or os.getenv("GROQ_API_KEY")
GROQ_CHAT_KEY = os.getenv("GROQ_CHAT_KEY") or os.getenv("GROQ_API_KEY")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="CareerArchitect AI - Max Content", version="18.0.0")

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
            return {"status": "error", "message": "No JSON found"}
        return json.loads(text[start:end+1])
    except Exception as e:
        logger.error(f"JSON Parse Error: {e}")
        return {"status": "error", "message": "Invalid JSON format"}

# ============================================
# ENDPOINT 1: ANALYZE (Max Content Logic)
# ============================================

# Place this ABOVE your @app.post("/analyze") line

@app.get("/")
def health_check():
    return {"status": "alive"}

@app.head("/")
def health_check_head():
    return {"status": "alive"}

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
        
        # === THE MAX CONTENT PROMPT ===
        prompt = """
        You are a Senior Engineering Mentor. Analyze this resume with high attention to detail.
        
        1. **MAXIMUM SKILL DETECTION:**
           - Extract EVERY technical keyword found (Languages, Frameworks, Libraries, Tools, Databases).
           - Look inside project descriptions (e.g., if they mention "JUnit", add it).
           - Do not ignore "secondary" skills like Git, Jira, or Postman; include them!

        2. **MISSING SKILLS (Growth Plan):**
           - Identify at least **4 to 6** critical skills they need to acquire to reach the next level.
           - Focus on modern industry standards (e.g., if they know Java, suggest Spring Cloud, Docker, Kubernetes, AWS).

        3. **DYNAMIC RADAR CHART:**
           - Generate 5 axes relevant to the candidate's specific domain (e.g., if Embedded -> "Low Level", if Web -> "Frontend").
           - Always include "Problem Solving".

        4. **DETAILED PROJECTS (3 Total):**
           - **Description:** Must be 3-4 sentences long. Explain the technical "How", the business "Why", and the complexity.
           - **Questions:** Generate **8** scenario-based interview questions per project.

        REQUIRED JSON STRUCTURE:
        {
          "status": "success",
          "candidate_profile": {
            "name": "Candidate Name",
            "total_score": 0-100, # Fair score (60-70 for good students)
            "market_fit_level": "Entry Level" | "Interview Ready" | "High Potential",
            "current_skills": ["List", "All", "Detected", "Skills", "Here", "Java", "Python", "Git", "etc"],
            "missing_skills": ["Gap 1", "Gap 2", "Gap 3", "Gap 4", "Gap 5", "Gap 6"] 
          },
          "radar_chart_data": [
            {"skill": "Problem Solving", "userScore": 60, "marketScore": 90},
            {"skill": "Dynamic Category 1", "userScore": 50, "marketScore": 85},
            {"skill": "Dynamic Category 2", "userScore": 40, "marketScore": 80},
            {"skill": "Dynamic Category 3", "userScore": 70, "marketScore": 95},
            {"skill": "Dynamic Category 4", "userScore": 20, "marketScore": 85}
          ],
          "recommended_projects": [
            {
              "type": "Gap Filler",
              "title": "Project Title",
              "tagline": "Compelling tagline",
              "description": "3-4 sentence detailed technical explanation. Cover the architecture, data flow, and key challenges solved.",
              "system_architecture": "Detailed tech breakdown (e.g., Microservices, Event Bus, Database choice).",
              "tech_stack": [{"name": "Tech", "usage": "Usage", "icon": "React"}],
              "learning_milestones": [{"week": 1, "task": "Detailed task..."}],
              "mock_interview_questions": [
                "Question 1?", "Question 2?", "Question 3?", "Question 4?", 
                "Question 5?", "Question 6?", "Question 7?", "Question 8?"
              ]
            },
            {
              "type": "Strength Builder",
              "title": "Project Title",
              "tagline": "Compelling tagline",
              "description": "3-4 sentence detailed technical explanation.",
              "system_architecture": "Detailed tech breakdown.",
              "tech_stack": [{"name": "Tech", "usage": "Usage", "icon": "Java"}],
              "learning_milestones": [{"week": 1, "task": "Detailed task..."}],
              "mock_interview_questions": ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8"]
            },
            {
              "type": "Showstopper",
              "title": "Project Title",
              "tagline": "Compelling tagline",
              "description": "3-4 sentence detailed technical explanation.",
              "system_architecture": "Detailed tech breakdown.",
              "tech_stack": [{"name": "Tech", "usage": "Usage", "icon": "Docker"}],
              "learning_milestones": [{"week": 1, "task": "Detailed task..."}],
              "mock_interview_questions": ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8"]
            }
          ]
        }

        RESUME TEXT:
        """ + text[:7000]

        logger.info("⏳ Sending Max Content Prompt...")
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a detailed Technical Mentor. Output valid JSON with rich content."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3, 
            max_tokens=7000, 
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

@app.post("/chat-with-mentor")
async def chat_with_mentor(request: dict):
    if not GROQ_CHAT_KEY: return {"reply": "Chat Service Unavailable"}
    return {"reply": "I can help you detailed questions about these projects!"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)