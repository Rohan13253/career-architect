import uvicorn
from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import PyPDF2
import io
import json
import re
import requests
import google.generativeai as genai
from groq import Groq
import os
import logging
import traceback
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

# ============================================
# CONFIGURATION
# ============================================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Configure Logging to ensure we see errors in Render
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="CareerArchitect AI Engine", version="5.0.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# AI CLIENT SETUP (Simplified & Safe)
# ============================================

# Configure Gemini directly (Skip complex list_models to prevent startup crash)
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    # Default to the best available model
    gemini_model = genai.GenerativeModel('gemini-1.5-flash')
    logger.info("✅ Gemini Configured (Lazy Loading)")
else:
    gemini_model = None
    logger.error("❌ GEMINI_API_KEY is missing!")

# Configure Groq
if GROQ_API_KEY:
    groq_client = Groq(api_key=GROQ_API_KEY)
    logger.info("✅ Groq Configured")
else:
    groq_client = None
    logger.warning("⚠️ GROQ_API_KEY is missing")

# ============================================
# HELPER FUNCTIONS
# ============================================

def extract_github_username(text: str) -> Optional[str]:
    try:
        match = re.search(r"github\.com/([a-zA-Z0-9-]+)", text, re.IGNORECASE)
        return match.group(1) if match else None
    except:
        return None

def fetch_github_data(username: str) -> str:
    try:
        if not username: return "No GitHub found."
        headers = {"Accept": "application/vnd.github.v3+json"}
        # Simple timeout to prevent hanging
        user_resp = requests.get(f"https://api.github.com/users/{username}", headers=headers, timeout=3)
        if user_resp.status_code != 200: return "GitHub Profile not found."
        
        user_data = user_resp.json()
        repos_resp = requests.get(f"https://api.github.com/users/{username}/repos?sort=updated&per_page=5", headers=headers, timeout=3)
        repos_data = repos_resp.json() if repos_resp.status_code == 200 else []
        
        evidence = f"✅ VERIFIED GITHUB: {username} (Repos: {user_data.get('public_repos', 0)})\n"
        for r in repos_data:
            evidence += f"- {r.get('name')}: {r.get('description', 'No desc')}\n"
        return evidence
    except Exception as e:
        logger.warning(f"GitHub fetch failed: {e}")
        return "Error fetching GitHub data."

def extract_text_from_pdf(file_content: bytes) -> str:
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        text = "\n".join([page.extract_text() for page in pdf_reader.pages])
        return text.strip()
    except Exception as e:
        logger.error(f"PDF Extraction Failed: {e}")
        return ""

def clean_json_response(text: str):
    try:
        # Find the first { and the last }
        start = text.find('{')
        end = text.rfind('}')
        if start == -1 or end == -1: 
            # Fallback if no JSON found
            return {"status": "error", "message": "AI did not return JSON"}
        
        json_str = text[start:end+1]
        return json.loads(json_str)
    except Exception as e:
        logger.error(f"JSON Parse Error: {e}")
        return {
            "status": "error", 
            "message": "Invalid JSON from AI",
            "raw_response": text[:100]
        }

# ============================================
# GLOBAL EXCEPTION HANDLER
# ============================================
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_msg = str(exc)
    logger.error(f"🔥 CRITICAL SERVER ERROR: {error_msg}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": f"Internal Server Error: {error_msg}"}
    )

# ============================================
# ENDPOINTS
# ============================================

@app.post("/analyze")
async def analyze(file: UploadFile = File(...), jd: Optional[str] = Form(None)):
    
    # 1. Check AI Status
    if not gemini_model: 
        return JSONResponse(status_code=503, content={"status": "error", "message": "AI Service Not Configured"})

    try:
        # 2. Read File
        content = await file.read()
        if not content:
            return JSONResponse(status_code=400, content={"status": "error", "message": "Empty file uploaded"})
            
        text = extract_text_from_pdf(content)
        if not text:
            return JSONResponse(status_code=400, content={"status": "error", "message": "Could not read text from PDF"})

        # 3. Get Context
        github_user = extract_github_username(text)
        github_evidence = fetch_github_data(github_user)
        
        # 4. Construct Prompt safely (NO F-STRINGS for User Content!)
        # We use string replacement to avoid crashing on curly braces in resumes
        base_prompt = """
Act as a Senior Tech Recruiter. Analyze this resume.
Return ONLY valid JSON.

REQUIRED JSON STRUCTURE:
{
  "status": "success",
  "candidate_profile": {
    "name": "Full Name",
    "total_score": 85,
    "market_fit_level": "Entry" | "Junior" | "Senior",
    "code_verified": true,
    "current_skills": ["Skill1", "Skill2"],
    "missing_skills": ["Skill3", "Skill4"]
  },
  "radar_chart_data": [
    {"skill": "Backend", "userScore": 70, "marketScore": 90},
    {"skill": "Frontend", "userScore": 60, "marketScore": 80},
    {"skill": "Cloud", "userScore": 50, "marketScore": 85},
    {"skill": "System Design", "userScore": 40, "marketScore": 80},
    {"skill": "Data Structures", "userScore": 75, "marketScore": 90}
  ],
  "recommended_projects": [
    {
      "type": "Gap Filler",
      "title": "Project Title",
      "tagline": "Short tagline",
      "description": "Full description",
      "system_architecture": "Architecture description",
      "tech_stack": [
        {"name": "Tech1", "usage": "Usage", "icon": "React"},
        {"name": "Tech2", "usage": "Usage", "icon": "Python"}
      ],
      "learning_milestones": [{"week": 1, "task": "Task 1"}],
      "mock_interview_questions": ["Question 1", "Question 2"]
    }
  ]
}

GITHUB CONTEXT:
""" + github_evidence + """

RESUME TEXT:
""" + text[:8000] + """

JOB DESCRIPTION:
""" + (jd if jd else "General Market Standards")

        # 5. Call Gemini
        logger.info("⏳ Sending request to Gemini...")
        response = gemini_model.generate_content(base_prompt)
        
        # 6. Parse Result
        result = clean_json_response(response.text)
        
        logger.info("✅ Analysis Success")
        return JSONResponse(content=result)

    except Exception as e:
        logger.error(f"❌ Analysis Logic Error: {e}")
        logger.error(traceback.format_exc()) # Print full error to logs
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

# Chat Endpoint (Unchanged but safe)
class ChatRequest(BaseModel):
    user_message: str
    chat_history: list = []
    context: dict 

@app.post("/chat-with-mentor")
async def chat_with_mentor(request: ChatRequest):
    if not groq_client: return {"reply": "Chat system offline (No Key)."}
    try:
        # Simplified chat logic
        msgs = [{"role": "system", "content": "You are a helpful Career Coach. Be brief."}]
        msgs.extend(request.chat_history[-4:])
        msgs.append({"role": "user", "content": request.user_message})
        
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=msgs,
            temperature=0.7,
            max_tokens=200
        )
        return {"reply": completion.choices[0].message.content}
    except Exception as e:
        logger.error(f"Chat Error: {e}")
        return {"reply": "I'm having a brain freeze. Ask me again!"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)