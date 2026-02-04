# 🚀 CareerArchitect.ai

> **AI-Powered Career Engineering Platform**  
> Transform your resume into a personalized career roadmap with AI-driven skill analysis, project recommendations, and interview preparation.

[![Version](https://img.shields.io/badge/version-18.0.0-blue.svg)](https://github.com/yourusername/careerarchitect)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.9+-yellow.svg)](https://www.python.org/)
[![Java](https://img.shields.io/badge/java-17+-orange.svg)](https://www.oracle.com/java/)
[![React](https://img.shields.io/badge/react-18+-61dafb.svg)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/firebase-10+-orange.svg)](https://firebase.google.com/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Firebase Authentication](#-firebase-authentication)
- [Project Structure](#-project-structure)
- [Key Components](#-key-components)
- [AI Analysis Logic](#-ai-analysis-logic)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**CareerArchitect.ai** is an intelligent career development platform that analyzes your resume using advanced AI (Groq's Llama 3.3 70B) to:

- 🔍 **Extract ALL technical skills** from your resume (even secondary tools like Git, Jira, Postman)
- 📊 **Generate dynamic skill radar charts** tailored to your domain (Web, Embedded, Data Science, etc.)
- 🎯 **Identify critical skill gaps** with 4-6 targeted missing skills for growth
- 🛠️ **Recommend 3 detailed projects** (Gap Filler, Strength Builder, Showstopper)
- 💼 **Provide 8 scenario-based interview questions** per project
- 💬 **Offer AI-powered career mentorship** via chat interface
- 📝 **Perform Job Description gap analysis** for targeted applications

### What Makes It Special?

Unlike traditional resume analyzers, CareerArchitect uses a **"Max Content"** approach:
- ✅ Detects **every** technical keyword (not just primary skills)
- ✅ Generates **3-4 sentence detailed project descriptions** (not generic templates)
- ✅ Creates **domain-specific radar charts** (not one-size-fits-all)
- ✅ Provides **8 deep interview questions** per project (not surface-level)
- ✅ Includes **optional JD analysis** for resume-job fit scoring

---

## ✨ Features

### 🏠 **Multi-Page Web Application**
- **Landing Page**: Hero section with stats (10K+ Blueprints, 500+ Skills, 95% Success Rate)
- **Login Page**: Firebase Authentication (Google Sign-In + Email/Password)
- **Dashboard**: Protected route with resume upload and analysis results
- **Projects View**: Dedicated page for project recommendations with modal details

### 🔐 **Authentication & Security**
- Firebase Authentication integration
- Protected routes with auto-redirect to login
- User session management
- Logout functionality with dropdown menu

### 📤 **Resume Upload**
- Wide rectangular upload banner with dashed border and glow effect
- Drag & drop support for PDF files
- File validation (type, size limit: 10MB)
- Real-time file info display

### 🤖 **AI-Powered Analysis**
- **Maximum skill detection**: Extracts ALL technical keywords from resume
- **Dynamic radar charts**: 5 axes tailored to your domain (e.g., "Low Level" for Embedded, "Frontend" for Web)
- **Missing skills identification**: 4-6 critical gaps for next-level growth
- **Fair scoring**: Realistic 60-70 scores for good students (not inflated)

### 📊 **Detailed Project Recommendations**
Each of the 3 projects includes:
- **Type**: Gap Filler / Strength Builder / Showstopper
- **Title & Tagline**: Compelling, professional naming
- **Description**: 3-4 sentences covering architecture, data flow, and key challenges
- **System Architecture**: Detailed tech breakdown (Microservices, Event Bus, etc.)
- **Tech Stack**: List with usage descriptions and icons
- **Learning Milestones**: Week-by-week roadmap
- **Mock Interview Questions**: 8 scenario-based questions per project
- **Resume Bullets**: Ready-to-use achievement statements

### 💬 **AI Career Mentor Chat**
- Floating Action Button (FAB) for easy access
- Context-aware chat with personalized greeting
- Discusses projects, skills, and career path
- Smooth animations and auto-scroll

### 🎨 **Beautiful UI/UX**
- **Lovable Design**: Deep navy gradient backgrounds with glassmorphism
- **Color Palette**: Purple (#8b5cf6) primary, Cyan (#06b6d4) accent
- **Responsive**: Mobile, tablet, and desktop optimized
- **Smooth Animations**: Transitions, hover effects, and loading states
- **Professional Typography**: Clean, modern font hierarchy

### 📝 **Optional Job Description Analysis**
- Paste target job description during upload
- AI compares your skills vs. job requirements
- Generates targeted gap analysis
- Helps prioritize which skills to learn first

---

## 🏗️ Architecture

CareerArchitect follows a **3-tier microservice architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Landing  │  │   Login   │  │Dashboard │  │ Projects │  │
│  │   Page   │  │   Page    │  │   Page   │  │   View   │  │
│  └────┬─────┘  └─────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       │              │              │             │         │
│       └──────────────┴──────────────┴─────────────┘         │
│                          │                                  │
│                    Firebase Auth                            │
│                          │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Port 5173 (Vite Dev)  │
              └────────────┬───────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND GATEWAY (Spring Boot)                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         AnalysisController                          │   │
│  │  • POST /api/v1/analyze?file=<pdf>&jd=<optional>   │   │
│  │  • GET  /api/v1/health                             │   │
│  │  • Validates PDF (type, size)                      │   │
│  │  • Forwards to Python AI Service                   │   │
│  │  • Handles errors gracefully                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                    Port 8080                                │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              PYTHON AI SERVICE (FastAPI)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         /analyze Endpoint                           │   │
│  │  • Extracts text from PDF (PyPDF2)                  │   │
│  │  • Sends to Groq (Llama 3.3 70B)                    │   │
│  │  • Max Content Prompt (7000 tokens)                 │   │
│  │  • Returns detailed JSON                            │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         /chat-with-mentor Endpoint                  │   │
│  │  • Conversational AI career mentor                  │   │
│  │  • Context-aware responses                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                    Port 5001                                │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           ▼
                  ┌────────────────┐
                  │   Groq Cloud   │
                  │ Llama 3.3 70B  │
                  └────────────────┘
```

### Data Flow

1. **User uploads PDF** on Dashboard (with optional JD text)
2. **React** sends multipart request to Spring Boot (`localhost:8080`)
3. **Spring Boot** validates file, forwards to Python (`localhost:5001`)
4. **Python** extracts PDF text, sends "Max Content" prompt to Groq
5. **Groq** returns JSON with skills, projects, and radar data
6. **Python** cleans/validates JSON, returns to Spring Boot
7. **Spring Boot** forwards to React
8. **React** displays results with visualizations and project cards

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **Authentication**: Firebase Authentication
- **Styling**: Pure CSS (no Tailwind!) with CSS custom properties
- **Icons**: Lucide React
- **Charts**: Recharts (Radar charts)
- **HTTP Client**: Fetch API

### Backend Gateway
- **Framework**: Spring Boot 3.2+
- **Language**: Java 17+
- **Build Tool**: Maven
- **HTTP Client**: RestTemplate
- **Logging**: SLF4J + Logback
- **Validation**: Spring Validation

### AI Service
- **Framework**: FastAPI
- **Language**: Python 3.9+
- **AI Provider**: Groq Cloud (Llama 3.3 70B Versatile)
- **PDF Parser**: PyPDF2
- **HTTP Server**: Uvicorn
- **Environment**: python-dotenv

### Infrastructure
- **Authentication**: Firebase (Google + Email/Password)
- **Development**: Localhost (multi-service)
- **Deployment**: Vercel (Frontend), Railway/Render (Backend), Fly.io (Python)

---

## 📋 Prerequisites

### Required Software
- **Node.js**: 18+ ([Download](https://nodejs.org/))
- **Java**: 17+ ([Download](https://www.oracle.com/java/technologies/downloads/))
- **Python**: 3.9+ ([Download](https://www.python.org/downloads/))
- **Maven**: 3.6+ ([Download](https://maven.apache.org/download.cgi))
- **Git**: Latest ([Download](https://git-scm.com/))

### API Keys
- **Groq API Key**: Free at [console.groq.com](https://console.groq.com/)
- **Firebase Project**: Free at [console.firebase.google.com](https://console.firebase.google.com/)

---

## 📥 Installation

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/careerarchitect.git
cd careerarchitect
```

### 2. Frontend Setup (React + Vite)

```bash
cd frontend-react
npm install
```

**Dependencies:**
```json
{
  "firebase": "^10.0.0",
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "react-router-dom": "^6.0.0",
  "lucide-react": "^0.263.1",
  "recharts": "^2.5.0"
}
```

### 3. Backend Setup (Spring Boot)

```bash
cd backend-java
mvn clean install
```

**Dependencies (pom.xml):**
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
    </dependency>
</dependencies>
```

### 4. Python AI Service Setup

```bash
cd python-ai
pip install -r requirements.txt
```

**requirements.txt:**
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
PyPDF2==3.0.1
python-dotenv==1.0.0
groq==0.4.0
pydantic==2.5.0
```

---

## ⚙️ Configuration

### 1. Firebase Configuration

**Create Firebase Project:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project: `CareerArchitect`
3. Enable Authentication → Email/Password + Google providers
4. Get web app config from Project Settings

**Add Firebase Keys:**

Edit `frontend-react/src/firebaseConfig.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456:web:abc123def456"
};
```

**Detailed guide:** See `FIREBASE-SETUP.md`

### 2. Groq API Configuration

**Get API Key:**
1. Go to [console.groq.com](https://console.groq.com/)
2. Create account (free)
3. Generate API key

**Create `.env` file in `python-ai/`:**

```bash
# python-ai/.env
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_ANALYSIS_KEY=gsk_your_groq_api_key_here  # Can be same
GROQ_CHAT_KEY=gsk_your_groq_api_key_here      # Can be same
```

### 3. Backend Configuration (Optional)

Edit `backend-java/src/main/resources/application.properties`:

```properties
# Server Configuration
server.port=8080

# AI Service Configuration
ai.service.url=http://localhost:5001
ai.service.timeout=30000

# File Upload Configuration
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Logging
logging.level.com.careerarchitect=INFO
```

---

## 🚀 Running the Application

### Start All Services (Recommended Order)

#### 1. Start Python AI Service

```bash
cd python-ai
python main.py
```

**Expected Output:**
```
--------------------------------------------------
🚀 STARTING GROQ-ONLY: MAX CONTENT EDITION
--------------------------------------------------
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:5001
```

#### 2. Start Spring Boot Backend

```bash
cd backend-java
mvn spring-boot:run
```

**Expected Output:**
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.2.0)

Started BackendApplication in 3.456 seconds
```

#### 3. Start React Frontend

```bash
cd frontend-react
npm run dev
```

**Expected Output:**
```
  VITE v5.0.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
```

### Access the Application

Open browser: **http://localhost:5173**

### Service Ports

| Service | Port | URL |
|---------|------|-----|
| **React Frontend** | 5173 | http://localhost:5173 |
| **Spring Boot Backend** | 8080 | http://localhost:8080/api/v1 |
| **Python AI Service** | 5001 | http://localhost:5001 |

---

## 📡 API Documentation

### Backend Gateway (Spring Boot)

#### 1. Analyze Resume

**Endpoint:** `POST /api/v1/analyze`

**Parameters:**
- `file` (required): PDF resume file (max 10MB)
- `jd` (optional): Job Description text for gap analysis

**Request Example (curl):**
```bash
curl -X POST http://localhost:8080/api/v1/analyze \
  -F "file=@resume.pdf" \
  -F "jd=We are looking for a Senior Java Developer with Spring Boot, Kubernetes, and AWS experience..."
```

**Response Example:**
```json
{
  "status": "success",
  "candidate_profile": {
    "name": "John Doe",
    "total_score": 68,
    "market_fit_level": "Interview Ready",
    "current_skills": ["Java", "Spring Boot", "MySQL", "Git", "Docker", "JUnit"],
    "missing_skills": ["Kubernetes", "AWS", "Microservices", "Kafka", "Redis", "CI/CD"]
  },
  "radar_chart_data": [
    {"skill": "Problem Solving", "userScore": 60, "marketScore": 90},
    {"skill": "Backend Development", "userScore": 70, "marketScore": 85},
    {"skill": "Cloud & DevOps", "userScore": 20, "marketScore": 85},
    {"skill": "Database Management", "userScore": 65, "marketScore": 80},
    {"skill": "API Design", "userScore": 55, "marketScore": 90}
  ],
  "recommended_projects": [
    {
      "type": "Gap Filler",
      "title": "Cloud-Native Microservices Platform",
      "tagline": "Build a Kubernetes-based microservices architecture with service mesh",
      "description": "Design and implement a distributed e-commerce backend using Spring Boot microservices orchestrated on Kubernetes. Implement service discovery with Eureka, API Gateway with Spring Cloud Gateway, and inter-service communication via Kafka. Deploy on AWS EKS with auto-scaling, health checks, and centralized logging using ELK stack.",
      "system_architecture": "Microservices: (1) Product Service, (2) Order Service, (3) User Service, (4) Payment Service. Communication: REST APIs + Kafka event bus. Infrastructure: AWS EKS cluster, RDS PostgreSQL, ElastiCache Redis, S3 for static assets. CI/CD: Jenkins pipeline with Docker builds.",
      "tech_stack": [
        {"name": "Spring Boot", "usage": "Microservice framework", "icon": "Java"},
        {"name": "Kubernetes", "usage": "Container orchestration", "icon": "Kubernetes"},
        {"name": "Kafka", "usage": "Event streaming", "icon": "Kafka"},
        {"name": "AWS EKS", "usage": "Managed Kubernetes", "icon": "AWS"},
        {"name": "PostgreSQL", "usage": "Relational database", "icon": "Database"}
      ],
      "learning_milestones": [
        {"week": 1, "task": "Set up local Kubernetes cluster with Minikube. Containerize a Spring Boot app with Docker and deploy to Minikube."},
        {"week": 2, "task": "Build Product Service with REST APIs (CRUD operations). Integrate PostgreSQL and write unit tests with JUnit and Mockito."},
        {"week": 3, "task": "Implement API Gateway with Spring Cloud Gateway. Add routing, load balancing, and request/response filters."},
        {"week": 4, "task": "Set up Kafka cluster. Implement event-driven communication: Order Service publishes order events, Payment Service consumes them."}
      ],
      "mock_interview_questions": [
        "How would you handle distributed transactions across microservices in this e-commerce system?",
        "Explain your strategy for service discovery in Kubernetes. Why use Eureka vs. Kubernetes DNS?",
        "How would you implement circuit breakers to prevent cascading failures between services?",
        "Describe your approach to securing inter-service communication. Would you use mTLS or API keys?",
        "How would you design the database schema to avoid tight coupling between microservices?",
        "What monitoring and logging strategy would you implement for debugging issues in production?",
        "How would you handle version compatibility when updating one microservice without breaking others?",
        "Explain your deployment strategy: blue-green, canary, or rolling updates? Why?"
      ]
    }
    // ... 2 more projects (Strength Builder, Showstopper)
  ],
  "jd_analysis": true
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "AI Service Unavailable",
  "details": "Cannot connect to Python AI service. Please ensure it is running on port 5001.",
  "path": "/api/v1/analyze"
}
```

#### 2. Health Check

**Endpoint:** `GET /api/v1/health`

**Response:**
```json
{
  "status": "healthy",
  "service": "Backend Gateway",
  "version": "2.0.0",
  "port": 8080,
  "ai_service": "connected",
  "ai_version": "18.0.0"
}
```

### Python AI Service

#### 1. Analyze Resume

**Endpoint:** `POST /analyze`

**Direct access:** http://localhost:5001/analyze

**Note:** Typically called via Spring Boot gateway, not directly from frontend.

#### 2. Chat with Mentor

**Endpoint:** `POST /chat-with-mentor`

**Request:**
```json
{
  "user_message": "How should I approach learning Kubernetes?",
  "chat_history": [],
  "context": { ... }
}
```

**Response:**
```json
{
  "reply": "Start with local development using Minikube..."
}
```

---

## 🔐 Firebase Authentication

### Supported Methods

1. **Google Sign-In** (One-click authentication)
2. **Email/Password** (Sign up + Sign in)

### User Flow

```
Landing Page (/)
    ↓
Click "Dashboard" or "Analyze My Career"
    ↓
Not logged in? → Redirect to /login
    ↓
Login Page
    ├─ Google Sign-In → Firebase popup
    └─ Email/Password → Firebase auth
    ↓
Successful? → Redirect to /dashboard
    ↓
Dashboard (Protected Route)
    ├─ Upload resume
    ├─ View analysis
    └─ Logout (dropdown menu)
```

### Protected Routes

Only accessible when authenticated:
- `/dashboard`

Public routes:
- `/` (Landing)
- `/login`

### Implementation

**File:** `frontend-react/src/firebaseConfig.js`

**Functions:**
- `signInWithEmail(email, password)` - Email/password sign-in
- `signUpWithEmail(email, password)` - Create new account
- `signInWithGoogle()` - Google OAuth popup
- `logout()` - Sign out current user
- `onAuthChange(callback)` - Listen to auth state changes

---

## 📁 Project Structure

```
careerarchitect/
│
├── frontend-react/                 # React + Vite Frontend
│   ├── src/
│   │   ├── firebaseConfig.js       # 🔥 Firebase auth setup
│   │   ├── App.jsx                 # Router + Protected Routes
│   │   ├── App.css                 # Complete styling (6000+ lines)
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx     # Hero section + features
│   │   │   ├── LoginPage.jsx       # Authentication UI
│   │   │   └── Dashboard.jsx       # Upload + analysis results
│   │   └── components/
│   │       ├── ScoreGauge.jsx      # Circular progress indicator
│   │       ├── ProjectsView.jsx    # Projects page with modal
│   │       └── FloatingChat.jsx    # Chat widget (FAB)
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend-java/                   # Spring Boot Backend Gateway
│   ├── src/main/java/com/careerarchitect/
│   │   ├── controller/
│   │   │   └── AnalysisController.java  # Main API controller
│   │   ├── dto/
│   │   │   ├── AnalysisResponse.java    # Response DTOs
│   │   │   ├── CandidateProfile.java
│   │   │   ├── RadarChartData.java
│   │   │   ├── ProjectRecommendation.java
│   │   │   └── ErrorResponse.java
│   │   └── BackendApplication.java
│   ├── src/main/resources/
│   │   └── application.properties   # Backend configuration
│   └── pom.xml
│
├── python-ai/                      # Python AI Service
│   ├── main.py                     # 🤖 FastAPI + Groq integration
│   ├── .env                        # API keys (not in git)
│   ├── requirements.txt
│   └── README.md
│
├── docs/                           # Documentation
│   ├── INSTALLATION.md
│   ├── FIREBASE-SETUP.md
│   └── API.md
│
├── .gitignore
├── README.md                       # This file
└── LICENSE
```

---

## 🔑 Key Components

### Frontend Components

#### 1. **LandingPage.jsx**
- Hero section with gradient title
- Stats display (10K+, 500+, 95%)
- Features section
- CTA cards
- Sticky navigation

#### 2. **LoginPage.jsx**
- Glassmorphism card design
- Google Sign-In button
- Email/Password form
- Toggle Sign In ↔ Sign Up
- Error handling

#### 3. **Dashboard.jsx**
- User menu (avatar dropdown)
- Wide rectangular upload banner
- Job Description textarea
- Analysis results display
- Score gauge + radar chart
- Skills cards (current + missing)
- Projects view toggle

#### 4. **ProjectsView.jsx**
- Project cards grid
- Click to open modal
- Sections: Overview, Architecture, Tech Stack, Milestones, Interview Questions
- Expandable accordion for questions

#### 5. **FloatingChat.jsx**
- FAB button (bottom-right)
- Popup chat window
- Auto-initialized greeting
- Context-aware responses
- Smooth animations

#### 6. **ScoreGauge.jsx**
- Circular SVG progress indicator
- Color-coded by score
- Animated transitions

### Backend Components

#### 1. **AnalysisController.java**
- Validates PDF uploads (type, size)
- Forwards requests to Python AI service
- Handles JD parameter
- Error handling with custom responses
- Health check endpoint

#### 2. **DTOs (Data Transfer Objects)**
- `AnalysisResponse`: Main response structure
- `CandidateProfile`: User info + skills
- `RadarChartData`: Chart visualization data
- `ProjectRecommendation`: Project details
- `ErrorResponse`: Standardized error format

### Python AI Service

#### 1. **main.py**
- FastAPI application
- PDF text extraction (PyPDF2)
- Groq API integration
- "Max Content" prompt engineering
- JSON response cleaning

---

## 🤖 AI Analysis Logic

### Max Content Prompt Strategy

The **"Max Content Edition"** uses an enhanced prompt that instructs the AI to:

1. **Extract EVERY skill** (not just primary ones)
   - Languages, frameworks, libraries, tools, databases
   - Secondary tools like Git, Jira, Postman
   - Skills mentioned in project descriptions

2. **Identify 4-6 critical missing skills**
   - Focus on modern industry standards
   - Relevant to candidate's domain
   - Actionable growth path

3. **Generate dynamic radar charts**
   - 5 axes tailored to domain (Web, Embedded, Data, etc.)
   - Always include "Problem Solving"
   - Realistic market scores

4. **Create detailed project descriptions**
   - 3-4 sentences covering:
     - Technical architecture
     - Business context
     - Key challenges solved
   - Not generic templates!

5. **Provide 8 scenario-based interview questions**
   - Per project (not surface-level)
   - Focus on scalability, trade-offs, design decisions

### Model Configuration

- **Model**: Llama 3.3 70B Versatile (Groq)
- **Temperature**: 0.3 (balanced creativity)
- **Max Tokens**: 7000 (detailed responses)
- **Response Format**: JSON object
- **Context Window**: 7000 chars from resume

### Fallback Handling

If Groq API fails:
- Returns error JSON with status
- Spring Boot catches and returns user-friendly message
- Frontend displays error alert

---

## 🌐 Deployment

### Frontend (Vercel)

```bash
cd frontend-react
npm run build

# Deploy to Vercel
vercel --prod
```

**Environment Variables (Vercel):**
```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_API_URL=https://your-backend.railway.app
```

### Backend (Railway / Render)

```bash
cd backend-java
mvn clean package

# Deploy JAR to Railway
railway up
```

**Environment Variables:**
```
AI_SERVICE_URL=https://your-python-service.fly.dev
AI_SERVICE_TIMEOUT=30000
```

### Python AI (Fly.io / Render)

```bash
cd python-ai

# Create fly.toml
fly launch

# Set secrets
fly secrets set GROQ_API_KEY=your_key

# Deploy
fly deploy
```

**Dockerfile:**
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5001
CMD ["python", "main.py"]
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Firebase: Error (auth/invalid-api-key)"

**Cause:** Wrong Firebase configuration

**Fix:**
1. Go to Firebase Console → Project Settings
2. Copy EXACT values from Web app config
3. Paste into `firebaseConfig.js`
4. Restart React dev server

#### 2. "AI Service Unavailable"

**Cause:** Python service not running or wrong port

**Fix:**
```bash
# Check if Python service is running
curl http://localhost:5001/health

# If not, start it
cd python-ai
python main.py
```

#### 3. "Empty or unreadable PDF"

**Cause:** Corrupted PDF or scanned image

**Fix:**
- Use a text-based PDF (not scanned)
- Try a different PDF
- Check PDF file size (< 10MB)

#### 4. Upload banner looks wrong

**Cause:** CSS not loading

**Fix:**
1. Verify `import './App.css'` in `App.jsx`
2. Clear browser cache (Ctrl+Shift+R)
3. Check browser console for CSS errors

#### 5. Can't access /dashboard even when logged in

**Cause:** Firebase auth state not syncing

**Fix:**
1. Check browser console for errors
2. Verify Firebase config is correct
3. Logout and login again
4. Clear browser local storage

### Development Tips

**Hot Reload Issues:**
```bash
# Kill all node processes
pkill -f node

# Restart React dev server
npm run dev
```

**Port Already in Use:**
```bash
# Find process using port 5173
lsof -i :5173

# Kill process
kill -9 <PID>
```

**CORS Errors:**
- Ensure Spring Boot has CORS enabled (already configured)
- Check that React is calling correct backend URL

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Coding Standards

- **React**: Functional components with hooks
- **Java**: Follow Spring Boot conventions
- **Python**: PEP 8 style guide
- **CSS**: Use CSS custom properties for theming

---

## 📜 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Groq** for lightning-fast Llama 3.3 70B API
- **Firebase** for seamless authentication
- **Lovable Design** for UI/UX inspiration
- **React** and **Spring Boot** communities

---

## 📧 Contact

**Project Maintainer**: Rohan Pawar  
**Email**: pawar.rohan.work@gmail.com
**GitHub**: [@rohan13253](https://github.com/Rohan13253)

---

## 🔮 Future Roadmap

- [ ] Save analysis history to Firestore
- [ ] Export analysis as PDF report
- [ ] GitHub repository analysis (auto-detect projects)
- [ ] LinkedIn profile integration
- [ ] Multi-language support (ES, FR, DE)
- [ ] Mobile app (React Native)
- [ ] Premium tier with advanced features
- [ ] Real-time collaboration (share analysis with mentors)

---

**Made with ❤️ by the CareerArchitect Team**

**⭐ Star this repo if it helped you!**