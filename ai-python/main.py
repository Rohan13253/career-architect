import uvicorn
from fastapi import FastAPI, UploadFile, File, Form
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
from typing import Optional, List
from dotenv import load_dotenv

load_dotenv()

# ============================================
# CONFIGURATION
# ============================================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="CareerArchitect AI Engine", version="5.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# AI CLIENT SETUP
# ============================================
gemini_model = None
groq_client = None

def setup_ai_clients():
    global gemini_model, groq_client
    
    # Setup Gemini
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        available_models = []
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                available_models.append(m.name)
        
        logger.info(f"🔍 Found Models: {available_models}")

        priorities = [
            'models/gemini-1.5-flash', 
            'models/gemini-1.5-pro', 
            'models/gemini-1.0-pro', 
            'models/gemini-pro'
        ]
        
        target_model = next((p for p in priorities if p in available_models), None)
        if not target_model and available_models:
            target_model = available_models[0]

        if target_model:
            gemini_model = genai.GenerativeModel(target_model)
            logger.info(f"✅ CONNECTED TO GEMINI: {target_model}")
        else:
            logger.error("❌ CRITICAL: No Gemini models found for this API Key.")

    except Exception as e:
        logger.error(f"❌ Gemini Setup Failed: {e}")

    # Setup Groq
    try:
        if GROQ_API_KEY and "gsk_" in GROQ_API_KEY:
            groq_client = Groq(api_key=GROQ_API_KEY)
            logger.info("✅ CONNECTED TO GROQ")
        else:
            logger.warning("⚠️ Groq Key invalid.")
    except Exception as e:
        logger.error(f"❌ Groq Setup Failed: {e}")

setup_ai_clients()

# ============================================
# HELPER FUNCTIONS
# ============================================

def extract_github_username(text: str) -> Optional[str]:
    match = re.search(r"github\.com/([a-zA-Z0-9-]+)", text, re.IGNORECASE)
    return match.group(1) if match else None

def fetch_github_data(username: str) -> str:
    try:
        headers = {"Accept": "application/vnd.github.v3+json"}
        user_resp = requests.get(f"https://api.github.com/users/{username}", headers=headers, timeout=5)
        if user_resp.status_code != 200: 
            return "GitHub Profile not found."
        
        user_data = user_resp.json()
        repos_resp = requests.get(
            f"https://api.github.com/users/{username}/repos?sort=updated&per_page=5", 
            headers=headers, 
            timeout=5
        )
        repos_data = repos_resp.json() if repos_resp.status_code == 200 else []
        
        evidence = f"✅ VERIFIED GITHUB: {username} (Repos: {user_data.get('public_repos')})\n"
        for r in repos_data:
            evidence += f"- {r['name']}: {r.get('description', 'No desc')}\n"
        return evidence
    except:
        return "Error fetching GitHub data."

def extract_text_from_pdf(file_content: bytes) -> str:
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        return "\n".join([page.extract_text() for page in pdf_reader.pages]).strip()
    except:
        return ""

def clean_json_response(text: str):
    try:
        start = text.find('{')
        end = text.rfind('}')
        if start == -1 or end == -1: 
            raise ValueError("No JSON found")
        return json.loads(text[start:end+1])
    except Exception as e:
        logger.error(f"JSON Parse Error: {e}")
        return {
            "status": "error",
            "candidate_profile": {
                "name": "Candidate", 
                "total_score": 50, 
                "market_fit_level": "Entry",
                "current_skills": ["Problem Solving"],
                "missing_skills": ["Parsing Error"]
            },
            "radar_chart_data": [],
            "recommended_projects": []
        }

# ============================================
# MAIN ANALYSIS ENDPOINT
# ============================================

@app.post("/analyze")
async def analyze(file: UploadFile = File(...), jd: Optional[str] = Form(None)):
    """
    UPDATED ANALYSIS ENDPOINT - Returns Expanded JSON Structure
    
    New Fields:
    - current_skills: Skills found in resume
    - missing_skills: Skills to acquire
    - system_architecture: High-level design description
    - mock_interview_questions: Technical interview questions
    - tech_stack_icons: Icon names for UI rendering
    """
    
    content = await file.read()
    text = extract_text_from_pdf(content)
    
    github_user = extract_github_username(text)
    github_evidence = fetch_github_data(github_user) if github_user else "No GitHub found."
    
    if not gemini_model: 
        return JSONResponse(content={"status": "error", "message": "AI Offline"})

    try:
        prompt = f"""
Act as a Senior Tech Recruiter and Career Architect. Analyze this resume comprehensively.

GITHUB EVIDENCE:
{github_evidence}

CRITICAL INSTRUCTIONS:
1. Return ONLY valid JSON (no markdown, no code blocks, no preamble).
2. Analyze the resume to extract CURRENT skills (what they already have).
3. Identify MISSING skills (what they need to acquire for market competitiveness).
4. For each recommended project, include:
   - System Architecture: A 2-3 sentence high-level design overview
   - Mock Interview Questions: 3-5 technical questions specific to this project
   - Tech Stack Icons: Exact icon names for UI (e.g., "React", "Docker", "AWS")

REQUIRED JSON STRUCTURE:
{{
  "status": "success",
  "candidate_profile": {{
    "name": "Full Name",
    "total_score": 85,
    "market_fit_level": "Entry" | "Junior" | "Senior",
    "code_verified": true,
    "github_handle": "{github_user or ''}",
    "current_skills": ["Skill1", "Skill2", "Skill3"],
    "missing_skills": ["Skill4", "Skill5", "Skill6"]
  }},
  "radar_chart_data": [
    {{"skill": "Backend Development", "userScore": 70, "marketScore": 90}},
    {{"skill": "System Design", "userScore": 60, "marketScore": 80}},
    {{"skill": "Frontend Development", "userScore": 80, "marketScore": 80}},
    {{"skill": "Cloud & DevOps", "userScore": 40, "marketScore": 90}},
    {{"skill": "Architecture", "userScore": 50, "marketScore": 85}}
  ],
  "recommended_projects": [
    {{
      "type": "Gap Filler",
      "title": "Real-Time Analytics Dashboard",
      "tagline": "Build production-grade streaming data pipeline",
      "description": "Create a comprehensive analytics platform that processes real-time data streams, visualizes metrics, and provides actionable insights.",
      "system_architecture": "The system follows a microservices architecture with an event-driven design. Data flows from multiple sources through Apache Kafka brokers, gets processed by Spring Boot services, stored in PostgreSQL for persistence and Redis for caching, then rendered via React frontend with WebSocket connections for real-time updates.",
      "tech_stack": [
        {{"name": "Spring Boot", "usage": "Backend microservices", "icon": "Spring"}},
        {{"name": "Apache Kafka", "usage": "Event streaming", "icon": "ApacheKafka"}},
        {{"name": "Redis", "usage": "Real-time caching", "icon": "Redis"}},
        {{"name": "PostgreSQL", "usage": "Data persistence", "icon": "PostgreSQL"}},
        {{"name": "React", "usage": "Frontend dashboard", "icon": "React"}},
        {{"name": "Docker", "usage": "Containerization", "icon": "Docker"}}
      ],
      "learning_milestones": [
        {{"week": 1, "task": "Setup Kafka cluster and implement producer/consumer services"}},
        {{"week": 2, "task": "Build REST APIs with Spring Boot and integrate Redis caching"}},
        {{"week": 3, "task": "Create React dashboard with WebSocket real-time updates"}},
        {{"week": 4, "task": "Deploy to AWS with Docker containers and load balancing"}}
      ],
      "mock_interview_questions": [
        "How would you handle data loss in your Kafka cluster during a broker failure?",
        "Explain your caching strategy using Redis. When would you invalidate the cache?",
        "How does your WebSocket connection maintain state across server restarts?",
        "What metrics would you monitor to ensure system health in production?",
        "Describe your approach to handling backpressure when consumers can't keep up with producers."
      ],
      "resume_bullets": [
        "Architected real-time analytics platform processing 10K events/sec using Kafka and Spring Boot microservices",
        "Implemented Redis caching layer reducing database queries by 70% and improving response time to <100ms",
        "Built responsive React dashboard with WebSocket integration for live data visualization",
        "Containerized application with Docker and deployed to AWS with 99.9% uptime SLA"
      ]
    }},
    {{
      "type": "Strength Builder",
      "title": "Microservices E-Commerce Platform",
      "tagline": "Demonstrate distributed systems mastery",
      "description": "Build a full-featured e-commerce platform using microservices architecture with service discovery, API gateway, and distributed tracing.",
      "system_architecture": "The platform uses Spring Cloud Netflix stack with Eureka for service discovery, Zuul as API gateway, and separate microservices for user management, inventory, orders, and payments. Each service has its own database (database-per-service pattern) and communicates via REST APIs and RabbitMQ for async operations.",
      "tech_stack": [
        {{"name": "Spring Cloud", "usage": "Microservices framework", "icon": "Spring"}},
        {{"name": "Eureka", "usage": "Service discovery", "icon": "Cloud"}},
        {{"name": "RabbitMQ", "usage": "Message broker", "icon": "RabbitMQ"}},
        {{"name": "MongoDB", "usage": "NoSQL database", "icon": "MongoDB"}},
        {{"name": "Angular", "usage": "Frontend SPA", "icon": "Angular"}},
        {{"name": "Kubernetes", "usage": "Orchestration", "icon": "Kubernetes"}}
      ],
      "learning_milestones": [
        {{"week": 1, "task": "Setup Eureka server and create user service microservice"}},
        {{"week": 2, "task": "Implement inventory and order services with inter-service communication"}},
        {{"week": 3, "task": "Add RabbitMQ for async order processing and notifications"}},
        {{"week": 4, "task": "Deploy to Kubernetes cluster with Helm charts"}}
      ],
      "mock_interview_questions": [
        "How do you handle distributed transactions across multiple microservices?",
        "Explain the difference between service discovery and API gateway patterns.",
        "What strategies would you use to maintain data consistency in a microservices architecture?",
        "How would you implement circuit breakers to prevent cascading failures?",
        "Describe your approach to monitoring and tracing requests across services."
      ],
      "resume_bullets": [
        "Designed microservices-based e-commerce platform serving 100K+ daily users with 99.95% uptime",
        "Implemented service mesh architecture using Spring Cloud and Kubernetes for auto-scaling",
        "Established CI/CD pipeline with Jenkins reducing deployment time from 2 hours to 15 minutes",
        "Integrated distributed tracing with Zipkin for debugging complex multi-service transactions"
      ]
    }},
    {{
      "type": "Showstopper",
      "title": "AI-Powered Code Review Assistant",
      "tagline": "Combine ML with software engineering",
      "description": "Build an intelligent system that automatically reviews pull requests, suggests improvements, detects security vulnerabilities, and ensures code quality standards.",
      "system_architecture": "The system integrates with GitHub webhooks to receive PR events, uses NLP models (BERT/GPT) for code analysis, maintains a vector database for similar code patterns, and provides feedback through GitHub API. Backend services are built with Python FastAPI, ML models run on TensorFlow Serving, and results are cached in Redis for performance.",
      "tech_stack": [
        {{"name": "Python", "usage": "Backend services", "icon": "Python"}},
        {{"name": "FastAPI", "usage": "REST API framework", "icon": "FastAPI"}},
        {{"name": "TensorFlow", "usage": "ML model serving", "icon": "TensorFlow"}},
        {{"name": "PostgreSQL", "usage": "Metadata storage", "icon": "PostgreSQL"}},
        {{"name": "Vue.js", "usage": "Admin dashboard", "icon": "Vue"}},
        {{"name": "GitHub Actions", "usage": "CI/CD automation", "icon": "GitHub"}}
      ],
      "learning_milestones": [
        {{"week": 1, "task": "Setup GitHub webhook integration and basic code parsing"}},
        {{"week": 2, "task": "Train ML model for code quality assessment using public datasets"}},
        {{"week": 3, "task": "Implement security vulnerability detection with static analysis"}},
        {{"week": 4, "task": "Build admin dashboard and deploy ML model to production"}}
      ],
      "mock_interview_questions": [
        "How would you train a model to understand code context and identify bugs?",
        "Explain your approach to handling false positives in automated code review.",
        "What techniques would you use to make the system language-agnostic?",
        "How do you ensure the ML model stays up-to-date with evolving coding standards?",
        "Describe your strategy for scaling the system to handle thousands of PRs per day."
      ],
      "resume_bullets": [
        "Developed AI-powered code review system reducing review time by 60% for 50+ engineering teams",
        "Fine-tuned BERT model on 1M+ code samples achieving 85% accuracy in bug detection",
        "Integrated with GitHub Enterprise processing 500+ pull requests daily with <2min analysis time",
        "Built feedback loop system incorporating developer corrections to continuously improve ML model"
      ]
    }}
  ]
}}

RESUME TEXT:
{text[:6000]}
"""
        
        if jd:
            prompt += f"\n\nJOB DESCRIPTION (Tailor analysis to this):\n{jd}"

        response = gemini_model.generate_content(prompt)
        result = clean_json_response(response.text)
        
        logger.info(f"✅ Analysis completed for {result.get('candidate_profile', {}).get('name', 'Unknown')}")
        return JSONResponse(content=result)
        
    except Exception as e:
        logger.error(f"❌ Analysis Error: {e}")
        return JSONResponse(content={"status": "error", "message": str(e)})


# ============================================
# CHAT ENDPOINT
# ============================================

class ChatRequest(BaseModel):
    user_message: str
    chat_history: list = []
    context: dict 

@app.post("/chat-with-mentor")
async def chat_with_mentor(request: ChatRequest):
    """Career mentor chatbot powered by Groq"""
    
    if not groq_client: 
        return {"reply": "Chat unavailable (API Key missing)."}

    try:
        profile = request.context.get("candidate_profile", {})
        current_skills = profile.get("current_skills", [])
        missing_skills = profile.get("missing_skills", [])
        
        system_prompt = f"""
You are a supportive Career Coach for {profile.get('name', 'User')}.

CANDIDATE STATS:
- Score: {profile.get('total_score')}/100
- Level: {profile.get('market_fit_level')}
- Current Skills: {', '.join(current_skills[:5])}
- Skills to Acquire: {', '.join(missing_skills[:5])}

INSTRUCTIONS:
- Keep responses under 100 words
- Be encouraging and actionable
- Focus on the recommended projects
- Suggest specific learning resources when relevant
- Use emojis sparingly for friendliness
"""
        
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(request.chat_history[-6:])
        messages.append({"role": "user", "content": request.user_message})

        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=300
        )
        
        return {"reply": completion.choices[0].message.content}
        
    except Exception as e:
        logger.error(f"❌ Chat Error: {e}")
        return {"reply": "I'm having trouble thinking right now. Try asking again!"}


# ============================================
# HEALTH CHECK
# ============================================

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "5.0.0",
        "gemini_configured": gemini_model is not None,
        "groq_configured": groq_client is not None,
        "features": [
            "Current Skills Detection",
            "System Architecture Generation",
            "Mock Interview Questions",
            "Tech Stack Icon Mapping"
        ]
    }


if __name__ == "__main__":
    logger.info("🚀 CareerArchitect AI Engine v5.0 - Lovable Design Edition")
    uvicorn.run(app, host="0.0.0.0", port=5001)
