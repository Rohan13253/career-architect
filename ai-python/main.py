print("--------------------------------------------------")
print("🚀 STARTING GROQ TRIPLE KEY: RESUME + LINKEDIN + CHAT")
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
import re
from typing import Optional
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

# Three separate Groq API keys
GROQ_ANALYSIS_KEY = os.getenv("GROQ_ANALYSIS_KEY")
GROQ_LINKEDIN_KEY = os.getenv("GROQ_LINKEDIN_KEY")
GROQ_CHAT_KEY = os.getenv("GROQ_CHAT_KEY")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="CareerArchitect AI - Triple Engine", version="19.0.0")

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
# LINKEDIN ANALYSIS HELPERS
# ============================================

def extract_linkedin_url(text: str) -> str:
    """Extract LinkedIn URL from text"""
    patterns = [
        r'linkedin\.com/in/[\w-]+',
        r'www\.linkedin\.com/in/[\w-]+',
        r'https?://(?:www\.)?linkedin\.com/in/[\w-]+'
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(0)
    return ""

def is_custom_linkedin_url(url: str) -> bool:
    """Check if LinkedIn URL is customized"""
    if not url:
        return False
    return not bool(re.search(r'\d{5,}', url))

def extract_email(text: str) -> str:
    """Extract email from text"""
    pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b'
    match = re.search(pattern, text)
    return match.group(0) if match else ""

def is_professional_email(email: str) -> bool:
    if not email:
        return False

    generic_providers = [
        'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'rediffmail.com'
    ]

    domain = email.split('@')[-1].lower()

    if domain in generic_providers:
        return False

    professional_tlds = [
        '.work', '.tech', '.dev', '.io', '.ai', '.co', '.me', '.in', '.app'
    ]

    if any(domain.endswith(tld) for tld in professional_tlds):
        return True

    return True

def extract_github_link(text: str) -> str:
    """Extract GitHub URL from text"""
    patterns = [
        r'github\.com/[\w-]+',
        r'www\.github\.com/[\w-]+',
        r'https?://(?:www\.)?github\.com/[\w-]+'
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(0)
    return ""

# ============================================
# HEALTH CHECK ENDPOINTS
# ============================================

@app.get("/")
def health_check():
    return {"status": "alive", "service": "CareerArchitect AI", "version": "19.0.0"}

@app.head("/")
def health_check_head():
    return {"status": "alive"}

# ============================================
# ENDPOINT 1: RESUME ANALYSIS
# ============================================

@app.post("/analyze")
async def analyze_resume(file: UploadFile = File(...), jd: Optional[str] = Form(None)):
    
    if not GROQ_ANALYSIS_KEY:
        return JSONResponse(status_code=503, content={"status": "error", "message": "GROQ_ANALYSIS_KEY missing"})

    try:
        content = await file.read()
        text = extract_text_from_pdf(content)
        if not text:
            return JSONResponse(status_code=400, content={"status": "error", "message": "Empty or unreadable PDF"})

        client = Groq(api_key=GROQ_ANALYSIS_KEY)
        
        prompt = """
       You are a Senior Engineering Mentor. Analyze this resume with high attention to detail.
       
        1. *MAXIMUM SKILL DETECTION:*
           - Extract EVERY technical keyword found (Languages, Frameworks, Libraries, Tools, Databases).
           - Look inside project descriptions (e.g., if they mention "JUnit", add it).
           - Do not ignore "secondary" skills like Git, Jira, or Postman; include them!

        2. *MISSING SKILLS (Growth Plan):*
           - Identify at least *4 to 6* critical skills they need to acquire to reach the next level.
           - Focus on modern industry standards (e.g., if they know Java, suggest Spring Cloud, Docker, Kubernetes, AWS).

        3. *DYNAMIC RADAR CHART:*
           - Generate 5 axes relevant to the candidate's specific domain (e.g., if Embedded -> "Low Level", if Web -> "Frontend").
           - Always include "Problem Solving".

        4. *DETAILED PROJECTS (3 Total):*
           - *Description:* Must be 3-4 sentences long. Explain the technical "How", the business "Why", and the complexity.
           - *Questions:* Generate *8* scenario-based interview questions per project.

        REQUIRED JSON STRUCTURE:
        {
          "status": "success",
          "candidate_profile": {
            "name": "Candidate Name",
            "total_score": 0-100,
            "market_fit_level": "Entry Level" | "Interview Ready" | "High Potential",
            "current_skills": ["Skill1", "Skill2", "Skill3", "..."],
            "missing_skills": ["Gap1", "Gap2", "Gap3", "Gap4", "Gap5", "Gap6"] 
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
              "description": "3-4 sentence detailed technical explanation.",
              "system_architecture": "Detailed tech breakdown.",
              "tech_stack": [{"name": "Tech", "usage": "Usage", "icon": "React"}],
              "learning_milestones": [{"week": 1, "task": "Detailed task..."}],
              "mock_interview_questions": ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8"]
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

        logger.info("⏳ Analyzing Resume...")
        
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
        
        logger.info("✅ Resume Analysis Complete")
        return JSONResponse(content=result)

    except Exception as e:
        logger.error(f"❌ Resume Analysis Error: {e}")
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

# ============================================
# ENDPOINT 2: LINKEDIN PROFILE ANALYSIS
# ============================================

@app.post("/analyze-linkedin")
async def analyze_linkedin(file: UploadFile = File(...)):
    
    if not GROQ_LINKEDIN_KEY:
        return JSONResponse(status_code=503, content={"status": "error", "message": "GROQ_LINKEDIN_KEY missing"})

    try:
        content = await file.read()
        text = extract_text_from_pdf(content)
        if not text:
            return JSONResponse(status_code=400, content={"status": "error", "message": "Empty or unreadable LinkedIn PDF"})

        # PRE-EXTRACTED REAL VALUES
        linkedin_url = extract_linkedin_url(text)
        is_custom_url = is_custom_linkedin_url(linkedin_url)

        email = extract_email(text)
        safe_email = email if email else "Not found"
        is_prof_email = is_professional_email(email)

        github_url = extract_github_link(text)

        client = Groq(api_key=GROQ_LINKEDIN_KEY)
        
        # ⭐ Inject REAL EMAIL and URL values directly into the structured logic
        prompt = f"""
        You are a LinkedIn Profile Optimization Expert and Career Coach. Analyze this LinkedIn profile PDF with extreme attention to professional branding details.

        **Pre-detected Information (use exactly as provided):**
        - LinkedIn URL: {linkedin_url or "Not found"}
        - Is Custom URL: {is_custom_url}
        - Email: {safe_email}
        - Is Professional Email: {is_prof_email}
        - GitHub Link: {github_url or "Not found"}

        **Important:**
        - DO NOT replace the email with descriptions like 'generic email' or 'custom domain email'.
        - Use the ACTUAL email `{safe_email}` inside the JSON field `"current"` for professional_email.
        - `"is_generic"` must be {str(not is_prof_email).lower()}.

        **Your Task:** Provide a complete LinkedIn professional audit.

        REQUIRED JSON STRUCTURE:
        {{
          "status": "success",
          "overall_score": 7.5,
          "professionalism_score": 8.2,
          "completeness_score": 6.5,
          "optimization_score": 7.8,

          "custom_url": {{
            "status": "excellent" | "good" | "needs_improvement" | "poor",
            "score": 8,
            "current": "{linkedin_url or 'Not found'}",
            "recommendation": "Specific actionable recommendation with example"
          }},

          "github_link": {{
            "status": "excellent" | "good" | "needs_improvement" | "poor",
            "score": 6,
            "current": "{github_url or 'Not found'}",
            "recommendation": "Add GitHub link to Featured or Contact Info section"
          }},

          "professional_email": {{
            "status": "excellent" | "good" | "needs_improvement" | "poor",
            "score": 5,
            "current": "{safe_email}",
            "is_generic": {str(not is_prof_email).lower()},
            "recommendation": "If this email is generic, consider using firstname.lastname@customdomain.com for stronger branding."
          }},

          "profile_header": {{
            "status": "excellent" | "good" | "needs_improvement" | "poor",
            "score": 7,
            "current": "Current headline text",
            "recommendation": "Optimized version of the headline with role + keywords"
          }},

          "summary": {{
            "status": "excellent" | "good" | "needs_improvement" | "poor",
            "score": 6,
            "current": "Summary evaluation",
            "recommendation": "Detailed improvements"
          }},

          "education": {{
            "status": "excellent" | "good" | "needs_improvement" | "poor",
            "score": 8,
            "current": "Education details",
            "recommendation": "Improvements"
          }},

          "certifications": {{
            "status": "excellent" | "good" | "needs_improvement" | "poor",
            "score": 4,
            "current": "Cert details",
            "recommendation": "Certs to add"
          }},

          "skills_section": {{
            "status": "excellent" | "good" | "needs_improvement" | "poor",
            "score": 7,
            "current": "Skill list summary",
            "recommendation": "Skill additions"
          }},

          "priority_actions": [
            {{
              "title": "Customize Your LinkedIn URL",
              "description": "How to fix",
              "impact": "High"
            }},
            {{
              "title": "Add GitHub to Featured",
              "description": "How to add",
              "impact": "Critical"
            }}
          ]
        }}

        LINKEDIN PROFILE TEXT:
        """ + text[:8000]

        logger.info("⏳ Analyzing LinkedIn Profile...")
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a LinkedIn Branding Expert. Output strictly valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.15,
            max_tokens=6000,
            response_format={"type": "json_object"}
        )

        raw_response = completion.choices[0].message.content
        result = clean_json_response(raw_response)

        logger.info("✅ LinkedIn Analysis Complete")
        return JSONResponse(content=result)

    except Exception as e:
        logger.error(f"❌ LinkedIn Analysis Error: {e}")
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

# ============================================
# ENDPOINT 3: CHAT WITH MENTOR
# ============================================

@app.post("/chat-with-mentor")
async def chat_with_mentor(request: dict):
    if not GROQ_CHAT_KEY:
        return {"reply": "Chat Service Unavailable"}
    
    try:
        user_message = request.get("message", "")
        context = request.get("context", "")
        
        client = Groq(api_key=GROQ_CHAT_KEY)
        
        system_prompt = "You are a helpful Career Mentor AI assistant. Provide detailed, actionable advice about career development, projects, and technical skills."
        
        if context:
            system_prompt += f"\n\nContext about the user:\n{context[:2000]}"
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.7,
            max_tokens=1500
        )
        
        reply = completion.choices[0].message.content
        return {"reply": reply}
        
    except Exception as e:
        logger.error(f"Chat Error: {e}")
        return {"reply": "Sorry, I encountered an error. Please try again."}

# ============================================
# SERVER STARTUP
# ============================================

if __name__ == "__main__":
    print("\n✅ All API Keys Loaded:")
    print(f"   - Resume Analysis: {'✓' if GROQ_ANALYSIS_KEY else '✗'}")
    print(f"   - LinkedIn Analysis: {'✓' if GROQ_LINKEDIN_KEY else '✗'}")
    print(f"   - Chat Service: {'✓' if GROQ_CHAT_KEY else '✗'}")
    print("\n🚀 Server starting on [http://0.0.0.0:5001](http://0.0.0.0:5001)\n")
    
    uvicorn.run(app, host="0.0.0.0", port=5001)