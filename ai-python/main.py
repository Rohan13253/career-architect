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
GROQ_ANALYSIS_KEY = os.getenv("GROQ_ANALYSIS_KEY") or os.getenv("GROQ_API_KEY")
GROQ_LINKEDIN_KEY = os.getenv("GROQ_LINKEDIN_KEY") or os.getenv("GROQ_API_KEY")
GROQ_CHAT_KEY = os.getenv("GROQ_CHAT_KEY") or os.getenv("GROQ_API_KEY")

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
    # Custom URLs don't have numbers at the end
    return not bool(re.search(r'\d{5,}', url))

def extract_email(text: str) -> str:
    """Extract email from text"""
    pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    match = re.search(pattern, text)
    return match.group(0) if match else ""

def is_professional_email(email: str) -> bool:
    """Check if email is professional (not generic providers)"""
    if not email:
        return False
    generic_providers = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'rediffmail.com']
    domain = email.split('@')[-1].lower()
    return domain not in generic_providers

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

        # Pre-extract some data for better analysis
        linkedin_url = extract_linkedin_url(text)
        is_custom_url = is_custom_linkedin_url(linkedin_url)
        email = extract_email(text)
        is_prof_email = is_professional_email(email)
        github_url = extract_github_link(text)
        
        client = Groq(api_key=GROQ_LINKEDIN_KEY)
        
        prompt = f"""
        You are a LinkedIn Profile Optimization Expert and Career Coach. Analyze this LinkedIn profile PDF with extreme attention to professional branding details.

        **CRITICAL INSTRUCTION - Email Field:**
        - The actual email found in the profile is: "{email or 'Not found'}"
        - You MUST use this exact email address in the "current" field of professional_email
        - DO NOT write descriptions like "Using generic email (gmail)" or "Professional email"
        - Write the ACTUAL email address: "{email or 'Not found'}"

        **Pre-detected Information:**
        - LinkedIn URL: {linkedin_url or "Not found"}
        - Is Custom URL: {is_custom_url}
        - Email Address: {email or "Not found"}
        - Is Professional Email Domain: {is_prof_email}
        - GitHub Link: {github_url or "Not found"}

        **Your Task:** Provide a comprehensive professional brand audit with scores out of 10 for each category.

        **Analysis Categories:**

        1. **Custom LinkedIn URL** (Score /10)
           - Current state: Use the actual URL "{linkedin_url or 'Not found'}"
           - Check if URL is customized (no random numbers)
           - Specific recommendation with example

        2. **GitHub Profile Link** (Score /10)
           - Current state: "{github_url or 'Not found'}"
           - Is GitHub link present in contact info or featured section?
           - Recommendation on how to add it if missing

        3. **Professional Email** (Score /10)
           - Current state: MUST be the actual email "{email or 'Not found'}"
           - Is it professional (custom domain) or generic (gmail/yahoo)?
           - Recommendation for improvement if needed

        4. **Profile Header/Headline** (Score /10)
           - Analyze the headline for clarity, keywords, and value proposition
           - Does it clearly state role + specialization?
           - Provide optimized version

        5. **Summary/About Section** (Score /10)
           - Is it compelling, keyword-rich, and story-driven?
           - Length appropriate (3-5 paragraphs)?
           - First-person narrative?
           - Provide improvement suggestions

        6. **Education Section** (Score /10)
           - Are all degrees listed with dates?
           - Activities/honors mentioned?
           - Recommendations for completion

        7. **Certifications** (Score /10)
           - Are relevant certifications listed?
           - Are they current?
           - Suggestions for valuable certs to add

        8. **Skills & Endorsements** (Score /10)
           - Top 3 skills aligned with career goals?
           - At least 5-10 skills listed?
           - Recommendations for skill additions

        **Scoring Guidelines:**
        - 9-10: Excellent, professional standard
        - 7-8: Good, minor improvements needed
        - 5-6: Needs work, several issues
        - 3-4: Poor, major gaps
        - 1-2: Critical issues, immediate attention required

        **Calculate Overall Scores:**
        - Overall Score: Average of all 8 categories (round to 1 decimal)
        - Professionalism Score: Average of Custom URL, Professional Email, Profile Header (round to 1 decimal)
        - Completeness Score: Average of Education, Certifications, Skills (round to 1 decimal)
        - Optimization Score: Average of Summary, GitHub Link, Skills (round to 1 decimal)

        **Priority Actions:** List 3-5 highest-impact action items with specific instructions.

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
            "recommendation": "Add GitHub link to Featured section or Contact Info. Example: github.com/yourhandle"
          }},
          "professional_email": {{
            "status": "excellent" | "good" | "needs_improvement" | "poor",
            "score": 5,
            "current": "{email or 'Not found'}",
            "recommendation": "Consider using firstname.lastname@customdomain.com for professional branding" | "Email looks professional, keep it!"
          }},
          "profile_header": {{
            "status": "excellent" | "good" | "needs_improvement" | "poor",
            "score": 7,
            "current": "Current headline text from profile",
            "recommendation": "Optimize to: 'Role | Specialization | Value Proposition' - Example: 'Full Stack Developer | React & Node.js Specialist | Building Scalable Web Applications'"
          }},
          "summary": {{
            "status": "excellent" | "good" | "needs_improvement" | "poor",
            "score": 6,
            "current": "Brief assessment of current summary (length, tone, keywords)",
            "recommendation": "Expand to 3-5 paragraphs covering: 1) Who you are professionally, 2) Key achievements & skills, 3) What you're passionate about, 4) Call to action. Use first-person narrative and include keywords for SEO."
          }},
          "education": {{
            "status": "excellent" | "good" | "needs_improvement" | "poor",
            "score": 8,
            "current": "Assessment of education section completeness",
            "recommendation": "Ensure all degrees list: Institution, Degree type, Major, Dates (start-end), GPA (if strong), Activities/Honors"
          }},
          "certifications": {{
            "status": "excellent" | "good" | "needs_improvement" | "poor",
            "score": 4,
            "current": "X certifications found" | "No certifications listed",
            "recommendation": "Add relevant certifications like AWS, Azure, Coursera courses, or industry-specific credentials. Include expiry dates if applicable."
          }},
          "skills_section": {{
            "status": "excellent" | "good" | "needs_improvement" | "poor",
            "score": 7,
            "current": "X skills listed, top 3 are: skill1, skill2, skill3",
            "recommendation": "Ensure top 3 skills match your target role. Add 5-10 more relevant skills. Ask colleagues for endorsements."
          }},
          "priority_actions": [
            {{
              "title": "Customize Your LinkedIn URL",
              "description": "Go to Settings > Edit Public Profile > Edit your custom URL. Change from linkedin.com/in/john-doe-123456 to linkedin.com/in/johndoe",
              "impact": "High"
            }},
            {{
              "title": "Add GitHub to Featured Section",
              "description": "Click 'Add profile section' > Featured > Add link to your GitHub profile with a professional description of your best projects",
              "impact": "Critical"
            }},
            {{
              "title": "Rewrite Your Headline",
              "description": "Change from generic title to value-driven headline: 'Software Engineer' → 'Full Stack Developer | React & Python | Building AI-Powered Web Apps'",
              "impact": "High"
            }}
          ]
        }}

        LINKEDIN PROFILE TEXT:
        """ + text[:8000]

        logger.info("⏳ Analyzing LinkedIn Profile...")
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a LinkedIn Career Coach and Branding Expert. Provide detailed, actionable feedback. Output valid JSON. ALWAYS use the actual email address in the 'current' field, never write descriptions."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2, 
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
    print("\n🚀 Server starting on http://0.0.0.0:5001\n")
    
    uvicorn.run(app, host="0.0.0.0", port=5001)