import uvicorn
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2
import io
import json
import re
import requests  # <--- NEW: To call GitHub API
import google.generativeai as genai
import logging
from typing import Optional, List

# ============================================
# CONFIGURATION
# ============================================

# 👇 YOUR API KEY
GEMINI_API_KEY = "API_KEY_WAIT_ME_DETO" 

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="CareerArchitect AI Engine", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# SMART MODEL SELECTOR
# ============================================
gemini_model = None

def setup_gemini():
    global gemini_model
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        all_models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        
        # Priority: Stable Flash -> Stable Pro -> Old Pro
        priorities = ['models/gemini-1.5-flash', 'models/gemini-1.5-pro', 'models/gemini-1.0-pro']
        target_model = next((p for p in priorities if p in all_models), all_models[0] if all_models else None)

        if target_model:
            clean_name = target_model.replace("models/", "")
            gemini_model = genai.GenerativeModel(clean_name)
            logger.info(f"✅ CONNECTED TO MODEL: {clean_name}")
        else:
            logger.error("❌ No Gemini models found.")
    except Exception as e:
        logger.error(f"❌ Setup Failed: {e}")

setup_gemini()

# ============================================
# NEW FEATURE: GITHUB VERIFICATION
# ============================================

def extract_github_username(text: str) -> Optional[str]:
    """Finds 'github.com/username' in text or hyperlinks"""
    # Regex for standard github urls
    match = re.search(r"github\.com/([a-zA-Z0-9-]+)", text, re.IGNORECASE)
    if match:
        return match.group(1)
    return None

def fetch_github_data(username: str) -> str:
    """Fetches public profile data from GitHub API"""
    try:
        # 1. Get User Details
        user_url = f"https://api.github.com/users/{username}"
        repo_url = f"https://api.github.com/users/{username}/repos?sort=updated&per_page=5"
        
        user_resp = requests.get(user_url, timeout=5)
        if user_resp.status_code != 200:
            return f"GitHub Profile '{username}' not found or private."
            
        user_data = user_resp.json()
        
        # 2. Get Recent Repos
        repos_resp = requests.get(repo_url, timeout=5)
        repos_data = repos_resp.json() if repos_resp.status_code == 200 else []
        
        # 3. Build Evidence String
        evidence = f"✅ GITHUB VERIFIED FOR: {username}\n"
        evidence += f"- Public Repos: {user_data.get('public_repos', 0)}\n"
        evidence += f"- Followers: {user_data.get('followers', 0)}\n"
        evidence += f"- Bio: {user_data.get('bio', 'No bio')}\n"
        evidence += "TOP 5 RECENT REPOS:\n"
        
        if not repos_data:
            evidence += "  (No public repositories found)\n"
            
        for r in repos_data:
            evidence += f"  * {r['name']} ({r.get('language', 'Unknown')})\n"
            evidence += f"    Desc: {r.get('description', 'No description')}\n"
            
        return evidence
    except Exception as e:
        logger.error(f"GitHub API Error: {e}")
        return "Error verifying GitHub profile."

# ============================================
# HELPER FUNCTIONS
# ============================================

def extract_text_from_pdf(file_content: bytes) -> str:
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        logger.error(f"PDF Error: {e}")
        return ""

def clean_json_response(text: str):
    try:
        start_idx = text.find('{')
        end_idx = text.rfind('}')
        if start_idx == -1 or end_idx == -1: raise ValueError("No JSON found")
        return json.loads(text[start_idx : end_idx + 1])
    except Exception as e:
        logger.error(f"JSON Clean Failed: {text[:100]}...")
        raise e

def build_gemini_prompt(resume_text: str, github_evidence: str, job_description: Optional[str] = None) -> str:
    base_instructions = f"""
    Act as a Senior Tech Recruiter. Analyze this resume.
    
    EVIDENCE FROM GITHUB (Use this to verify their claims):
    {github_evidence}
    
    INSTRUCTIONS:
    1. Return raw JSON only.
    2. 'code_verified': Set to true if GitHub evidence is strong, false otherwise.
    3. 'market_fit_level': Adjust based on REAL code evidence. If they claim "Expert" but have no code, lower the level.
    4. Provide 3 distinct projects (Gap Filler, Strength Builder, Showstopper).
    
    REQUIRED JSON STRUCTURE:
    {{
      "status": "success",
      "candidate_profile": {{
        "name": "Extract Name",
        "total_score": <0-100>,
        "market_fit_level": "Level", 
        "code_verified": <true/false>,
        "github_handle": "username_if_found",
        "missing_skills": ["Skill1", "Skill2"]
      }},
      "radar_chart_data": [
        {{"skill": "Coding", "userScore": <0-100>, "marketScore": 90}},
        {{"skill": "System Design", "userScore": <0-100>, "marketScore": 85}},
        {{"skill": "Communication", "userScore": <0-100>, "marketScore": 80}},
        {{"skill": "Cloud", "userScore": <0-100>, "marketScore": 90}},
        {{"skill": "Architecture", "userScore": <0-100>, "marketScore": 85}}
      ],
      "recommended_projects": [
        {{
            "type": "Gap Filler",
            "title": "Title",
            "tagline": "Tagline",
            "description": "Desc",
            "tech_stack": [{{"name": "Tech", "usage": "Usage"}}],
            "learning_milestones": [{{"week": 1, "task": "Task"}}],
            "resume_bullets": ["Bullet 1"]
        }}
      ]
    }}
    """

    if job_description:
        return f"""{base_instructions}
        MODE: JD Gap Analysis
        JOB DESCRIPTION: {job_description}
        RESUME: {resume_text[:4000]}
        """
    else:
        return f"""{base_instructions}
        MODE: General Market Audit
        RESUME: {resume_text[:4000]}
        """

# ============================================
# ENDPOINT
# ============================================

@app.post("/analyze")
async def analyze(file: UploadFile = File(...), jd: Optional[str] = Form(None)):
    content = await file.read()
    text = extract_text_from_pdf(content)
    
    # 1. EXTRACT & VERIFY GITHUB
    github_user = extract_github_username(text)
    github_evidence = "No GitHub link found in resume."
    if github_user:
        logger.info(f"🔍 Found GitHub: {github_user}. Verifying...")
        github_evidence = fetch_github_data(github_user)
    
    if not gemini_model:
        return JSONResponse(content={"status": "error", "message": "AI Module Offline"})

    try:
        prompt = build_gemini_prompt(text, github_evidence, jd)
        response = gemini_model.generate_content(prompt)
        data = clean_json_response(response.text)
        
        # Backwards compatibility
        if "recommended_projects" in data and len(data["recommended_projects"]) > 0:
            data["project_blueprint"] = data["recommended_projects"][0]
            
        return JSONResponse(content=data)
        
    except Exception as e:
        logger.error(f"AI Failed: {e}")
        return JSONResponse(content={"status": "error"})

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)