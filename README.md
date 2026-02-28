# 🚀 CareerArchitect.ai

> **AI-Powered Career Engineering Platform**  
> Transform your resume into a personalized career roadmap with AI-driven skill analysis, project recommendations, and interview preparation.

[![Version](https://img.shields.io/badge/version-19.0.0-blue.svg)](https://github.com/yourusername/careerarchitect)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.9+-yellow.svg)](https://www.python.org/)
[![Java](https://img.shields.io/badge/java-17+-orange.svg)](https://www.oracle.com/java/)
[![React](https://img.shields.io/badge/react-18+-61dafb.svg)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/firebase-10+-orange.svg)](https://firebase.google.com/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-15+-blue.svg)](https://www.postgresql.org/)

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
- 💼 **Analyze LinkedIn profiles** in addition to traditional resumes

### What Makes It Special?

Unlike traditional resume analyzers, CareerArchitect uses a **"Max Content"** approach:
- ✅ Detects **every** technical keyword (not just primary skills)
- ✅ Generates **3-4 sentence detailed project descriptions** (not generic templates)
- ✅ Creates **domain-specific radar charts** (not one-size-fits-all)
- ✅ Provides **8 deep interview questions** per project (not surface-level)
- ✅ Includes **optional JD analysis** for resume-job fit scoring
- ✅ **Persists analysis history** to PostgreSQL for long-term tracking

---

## ✨ Features

### 🏠 **Multi-Page Web Application**
- **Landing Page**: Hero section with stats (10K+ Blueprints, 500+ Skills, 95% Success Rate)
- **Login Page**: Firebase Authentication (Google Sign-In + Email/Password)
- **Dashboard**: Protected route with resume upload and analysis results
- **Projects View**: Dedicated page for project recommendations with modal details
- **History View**: Browse and manage past analyses with statistics

### 🔐 **Authentication & Security**
- Firebase Authentication integration
- Protected routes with auto-redirect to login
- User session management
- Logout functionality with dropdown menu

### 📤 **Resume & LinkedIn Upload**
- Wide rectangular upload banner with dashed border and glow effect
- Drag & drop support for PDF files
- File validation (type, size limit: 10MB)
- Real-time file info display
- **NEW**: LinkedIn profile analysis endpoint

### ⚡ **Performance Optimization**
- **Smart Server Wake-Up**: Proactive health check triggered on page load to eliminate cold-start latency on free-tier cloud deployments (Render, Railway)
- Background ping to `/api/v1/ping` endpoint keeps services warm
- Seamless user experience with no waiting for server spin-up

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

### 💾 **Persistent Data Storage**
- **PostgreSQL database** (Supabase) stores all analysis results
- User profiles with statistics (total analyses, best score)
- Complete analysis history with full JSON preservation
- Filter and search past analyses
- Delete or archive old results

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

CareerArchitect follows a **4-tier microservice architecture** with persistent storage:

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Landing  │  │   Login   │  │Dashboard │  │ History  │  │
│  │   Page   │  │   Page    │  │   Page   │  │   View   │  │
│  └────┬─────┘  └─────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       │              │              │             │         │
│       │   (Wake-up ping on load)   │             │         │
│       └──────────────┴──────────────┴─────────────┘         │
│                          │                                  │
│                    Firebase Auth                            │
│                          │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Port 5173 (Vite Dev)  │
              │   or Vercel (Prod)     │
              └────────────┬───────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND GATEWAY (Spring Boot)                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         AnalysisController                          │   │
│  │  • GET  /api/v1/ping (wake-up endpoint)            │   │
│  │  • POST /api/v1/analyze?file=<pdf>&jd=<optional>   │   │
│  │  • POST /api/v1/analyze-linkedin?file=<pdf>        │   │
│  │  • GET  /api/v1/history                            │   │
│  │  • DELETE /api/v1/analysis/{id}                    │   │
│  │  • Validates PDF (type, size)                      │   │
│  │  • Forwards to Python AI Service                   │   │
│  │  • Persists results to PostgreSQL                  │   │
│  │  • Handles errors gracefully                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                    Port 8080                                │
│                   (or Render URL)                           │
└──────────────────────────┼──────────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             │                           │
             ▼                           ▼
┌────────────────────────┐   ┌──────────────────────────┐
│   PostgreSQL Database  │   │  PYTHON AI SERVICE       │
│     (Supabase)         │   │     (FastAPI)            │
│                        │   │  ┌────────────────────┐  │
│  • users               │   │  │  /analyze          │  │
│  • analyses            │   │  │  /analyze-linkedin │  │
│  • Full JSON storage   │   │  │  /chat-with-mentor │  │
│  • Analysis history    │   │  └────────────────────┘  │
│  • User statistics     │   │                          │
└────────────────────────┘   │      Port 5001           │
                             │   (or Fly.io/Render URL) │
                             └────────────┬─────────────┘
                                          │
                                          ▼
                                 ┌────────────────┐
                                 │   Groq Cloud   │
                                 │ Llama 3.3 70B  │
                                 └────────────────┘
```

### Data Flow

1. **User uploads PDF** on Dashboard (with optional JD text)
2. **React triggers wake-up ping** to `/api/v1/ping` (if needed) to eliminate cold-start
3. **React** sends multipart request to Spring Boot (`localhost:8080` or Render URL via `VITE_API_URL`)
4. **Spring Boot** validates file, forwards to Python (`localhost:5001` or Fly.io URL)
5. **Python** extracts PDF text, sends "Max Content" prompt to Groq
6. **Groq** returns JSON with skills, projects, and radar data
7. **Python** cleans/validates JSON, returns to Spring Boot
8. **Spring Boot** persists analysis to PostgreSQL (user, scores, full JSON)
9. **Spring Boot** forwards enhanced response to React
10. **React** displays results with visualizations and project cards
11. **User can view history** - Spring Boot queries PostgreSQL for past analyses

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
- **Environment Config**: `.env` file with `VITE_API_URL` for flexible backend targeting

### Backend Gateway
- **Framework**: Spring Boot 3.2+
- **Language**: Java 17+
- **Build Tool**: Maven
- **HTTP Client**: RestTemplate
- **Logging**: SLF4J + Logback
- **Validation**: Spring Validation
- **ORM**: Spring Data JPA
- **JSON Processing**: Jackson ObjectMapper

### Data Layer
- **Database**: PostgreSQL 15+
- **Hosting**: Supabase (managed PostgreSQL)
- **Tables**: `users`, `analyses` with full JSONB support
- **Features**: Analysis history, user statistics, soft deletes

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
- **Deployment**: Vercel (Frontend), Render (Backend + Python), Supabase (Database)
- **Cold-Start Optimization**: Proactive health checks via `/ping` endpoint

---

## 📋 Prerequisites

### Required Software
- **Node.js**: 18+ ([Download](https://nodejs.org/))
- **Java**: 17+ ([Download](https://www.oracle.com/java/technologies/downloads/))
- **Python**: 3.9+ ([Download](https://www.python.org/downloads/))
- **Maven**: 3.6+ ([Download](https://maven.apache.org/download.cgi))
- **Git**: Latest ([Download](https://git-scm.com/))

### API Keys & Services
- **Groq API Key**: Free at [console.groq.com](https://console.groq.com/)
- **Firebase Project**: Free at [console.firebase.google.com](https://console.firebase.google.com/)
- **Supabase Account**: Free at [supabase.com](https://supabase.com/) for PostgreSQL database

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
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
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

### 5. Database Setup (Supabase)

1. Create a free account at [supabase.com](https://supabase.com/)
2. Create a new project
3. Navigate to SQL Editor
4. Run the database schema (see `database/schema.sql`)
5. Copy the connection string from Project Settings → Database

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
GROQ_LINKEDIN_KEY=gsk_your_groq_api_key_here  # Can be same
GROQ_CHAT_KEY=gsk_your_groq_api_key_here      # Can be same
```

### 3. Backend Configuration

Edit `backend-java/src/main/resources/application.properties`:

```properties
# Server Configuration
server.port=8080

# AI Service Configuration
ai.service.url=http://localhost:5001
ai.service.timeout=30000

# Database Configuration (Supabase PostgreSQL)
spring.datasource.url=jdbc:postgresql://[YOUR-SUPABASE-HOST]:5432/postgres
spring.datasource.username=[YOUR-SUPABASE-USER]
spring.datasource.password=[YOUR-SUPABASE-PASSWORD]
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# File Upload Configuration
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Logging
logging.level.com.careerarchitect=INFO
```

**Get Supabase Connection Details:**
1. Supabase Dashboard → Project Settings → Database
2. Copy connection string components (host, user, password)

### 4. Frontend Environment Configuration

**Create `.env` file in `frontend-react/`:**

For local development:
```bash
# frontend-react/.env
VITE_API_URL=http://localhost:8080/api/v1
```

For production (update before deploying to Vercel):
```bash
# frontend-react/.env.production
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

This allows the frontend to seamlessly switch between local and production backends without code changes.

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
✅ All API Keys Loaded:
   - Resume Analysis: {'✓' if GROQ_ANALYSIS_KEY else '✗'}
   - LinkedIn Analysis: {'✓' if GROQ_LINKEDIN_KEY else '✗'}
   - Chat Service: {'✓' if GROQ_CHAT_KEY else '✗'}
🚀 Server starting on http://0.0.0.0:5001
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

Connected to PostgreSQL database: postgres
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
  
  Wake-up ping sent to backend...
```

### Access the Application

Open browser: **http://localhost:5173**

The frontend will automatically send a wake-up ping to the backend on page load to ensure zero cold-start delay.

### Service Ports

| Service | Port | Local URL | Production URL |
|---------|------|-----------|----------------|
| **React Frontend** | 5173 | http://localhost:5173 | https://your-app.vercel.app |
| **Spring Boot Backend** | 8080 | http://localhost:8080/api/v1 | https://your-backend.onrender.com/api/v1 |
| **Python AI Service** | 5001 | http://localhost:5001 | https://your-python.onrender.com |
| **PostgreSQL Database** | 5432 | N/A (Supabase managed) | Supabase connection string |

---

## 📡 API Documentation

### Backend Gateway (Spring Boot)

#### 1. Wake-Up Ping (Performance Optimization)

**Endpoint:** `GET /api/v1/ping`

**Purpose:** Eliminate cold-start latency on free-tier cloud deployments

**Response:**
```json
"Server is awake!"
```

**Client Implementation (React):**
```javascript
// In App.jsx - triggered on page load
useEffect(() => {
  fetch('https://career-architect-1.onrender.com/api/v1/ping')
    .then(res => console.log("Backend warmed up!"))
    .catch(err => console.log("Waking up backend..."));
}, []);
```

This proactive health check ensures the backend is ready before users attempt to upload files, providing a seamless experience.

#### 2. Analyze Resume

**Endpoint:** `POST /api/v1/analyze`

**Parameters:**
- `file` (required): PDF resume file (max 10MB)
- `jd` (optional): Job Description text for gap analysis

**Headers:**
- `X-Firebase-UID`: User's Firebase authentication ID
- `X-User-Email`: User's email address

**Request Example (curl):**
```bash
curl -X POST http://localhost:8080/api/v1/analyze \
  -H "X-Firebase-UID: abc123xyz" \
  -H "X-User-Email: user@example.com" \
  -F "file=@resume.pdf" \
  -F "jd=We are looking for a Senior Java Developer with Spring Boot, Kubernetes, and AWS experience..."
```

**Response Example:**
```json
{
  "status": "success",
  "analysis_id": "7d77c196-1a2b-3c4d-5e6f-789012345678",
  "analysis_type": "RESUME",
  "saved_to_database": true,
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
      "description": "Design and implement...",
      "system_architecture": "Microservices: ...",
      "tech_stack": [...],
      "learning_milestones": [...],
      "mock_interview_questions": [...]
    }
  ]
}
```

#### 3. Analyze LinkedIn Profile (NEW)

**Endpoint:** `POST /api/v1/analyze-linkedin`

**Purpose:** Analyze LinkedIn profile exports or screenshots for career insights

**Parameters:**
- `file` (required): PDF file containing LinkedIn profile data

**Headers:**
- `X-Firebase-UID`: User's Firebase authentication ID
- `X-User-Email`: User's email address

**Request Example:**
```bash
curl -X POST http://localhost:8080/api/v1/analyze-linkedin \
  -H "X-Firebase-UID: abc123xyz" \
  -H "X-User-Email: user@example.com" \
  -F "file=@linkedin_profile.pdf"
```

**Response Structure:**
Similar to resume analysis, but optimized for LinkedIn profile data structure. Returns skill analysis, experience validation, and networking recommendations.

**Note:** Job Description parameter is not required for LinkedIn analysis.

#### 4. Get Analysis History

**Endpoint:** `GET /api/v1/history`

**Headers:**
- `X-Firebase-UID`: User's Firebase authentication ID

**Response:**
```json
{
  "total": 5,
  "analyses": [
    {
      "id": "7d77c196-...",
      "candidateName": "John Doe",
      "overallScore": 68,
      "analysisType": "RESUME",
      "createdAt": "2026-02-25T12:00:00",
      "jobDescription": "Senior Java Developer...",
      "fullAnalysisJson": "{...}"
    }
  ]
}
```

#### 5. Delete Analysis

**Endpoint:** `DELETE /api/v1/analysis/{id}`

**Headers:**
- `X-Firebase-UID`: User's Firebase authentication ID

**Response:**
```json
{
  "success": true
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

### Python AI Service

#### 1. Analyze Resume

**Endpoint:** `POST /analyze`

**Direct access:** http://localhost:5001/analyze

**Note:** Typically called via Spring Boot gateway, not directly from frontend.

#### 2. Analyze LinkedIn

**Endpoint:** `POST /analyze-linkedin`

**Direct access:** http://localhost:5001/analyze-linkedin

**Processing:** Uses specialized prompt for LinkedIn profile structure and data extraction.

#### 3. Chat with Mentor

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
    ├─ Browse history
    └─ Logout (dropdown menu)
```

### Protected Routes

Only accessible when authenticated:
- `/dashboard`
- `/history`

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
│   │   ├── App.jsx                 # Router + Protected Routes + Wake-up ping
│   │   ├── App.css                 # Complete styling (6000+ lines)
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx     # Hero section + features
│   │   │   ├── LoginPage.jsx       # Authentication UI
│   │   │   ├── Dashboard.jsx       # Upload + analysis results
│   │   │   └── History.jsx         # Analysis history browser
│   │   └── components/
│   │       ├── ScoreGauge.jsx      # Circular progress indicator
│   │       ├── ProjectsView.jsx    # Projects page with modal
│   │       └── FloatingChat.jsx    # Chat widget (FAB)
│   ├── public/
│   ├── .env                        # Environment config (VITE_API_URL)
│   ├── package.json
│   └── vite.config.js
│
├── backend-java/                   # Spring Boot Backend Gateway
│   ├── src/main/java/com/careerarchitect/
│   │   ├── controller/
│   │   │   └── AnalysisController.java  # Main API controller + /ping endpoint
│   │   ├── model/
│   │   │   ├── User.java                # JPA User entity
│   │   │   └── Analysis.java            # JPA Analysis entity
│   │   ├── repository/
│   │   │   ├── UserRepository.java      # User data access
│   │   │   └── AnalysisRepository.java  # Analysis data access
│   │   ├── dto/
│   │   │   ├── AnalysisResponse.java    # Response DTOs
│   │   │   ├── CandidateProfile.java
│   │   │   └── ErrorResponse.java
│   │   └── BackendApplication.java
│   ├── src/main/resources/
│   │   └── application.properties   # Backend + Database configuration
│   └── pom.xml
│
├── python-ai/                      # Python AI Service
│   ├── main.py                     # 🤖 FastAPI + Groq integration
│   ├── .env                        # API keys (not in git)
│   ├── requirements.txt
│   └── README.md
│
├── database/                       # Database Schema
│   └── schema.sql                  # PostgreSQL table definitions
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
- Resume AND LinkedIn upload options
- Job Description textarea
- Analysis results display
- Score gauge + radar chart
- Skills cards (current + missing)
- Projects view toggle

#### 4. **History.jsx (NEW)**
- Statistics cards (total, average, best score, trend)
- Timeline of past analyses
- Filter by analysis type (Resume vs LinkedIn)
- View full analysis details
- Delete analyses
- Database-powered pagination

#### 5. **ProjectsView.jsx**
- Project cards grid
- Click to open modal
- Sections: Overview, Architecture, Tech Stack, Milestones, Interview Questions
- Expandable accordion for questions

#### 6. **FloatingChat.jsx**
- FAB button (bottom-right)
- Popup chat window
- Auto-initialized greeting
- Context-aware responses
- Smooth animations

#### 7. **ScoreGauge.jsx**
- Circular SVG progress indicator
- Color-coded by score
- Animated transitions

### Backend Components

#### 1. **AnalysisController.java (ENHANCED)**
- `/ping` endpoint for wake-up health checks
- Validates PDF uploads (type, size)
- Unified processing for Resume AND LinkedIn analysis
- Forwards requests to Python AI service
- Persists results to PostgreSQL
- Handles JD parameter
- Error handling with custom responses
- History retrieval with user filtering

#### 2. **JPA Entities**
- `User.java`: Firebase UID, email, statistics
- `Analysis.java`: Complete analysis with JSONB storage, analysis type flag

#### 3. **Repositories**
- `UserRepository`: User CRUD operations
- `AnalysisRepository`: Analysis history queries

#### 4. **DTOs (Data Transfer Objects)**
- `AnalysisResponse`: Main response structure
- `CandidateProfile`: User info + skills
- `ErrorResponse`: Standardized error format

### Python AI Service

#### 1. **main.py**
- FastAPI application
- PDF text extraction (PyPDF2)
- Groq API integration
- "Max Content" prompt engineering
- LinkedIn-specific analysis logic
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
- **Context Window**: 7000 chars from resume/LinkedIn

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
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

**Important:** Set `VITE_API_URL` to point to your production backend (Render, Railway, etc.), not localhost.

### Backend (Render)

```bash
cd backend-java
mvn clean package

# Deploy JAR to Render
# Configure build command: mvn clean package
# Configure start command: java -jar target/backend-0.0.1-SNAPSHOT.jar
```

**Environment Variables (Render):**
```
AI_SERVICE_URL=https://your-python-service.onrender.com
AI_SERVICE_TIMEOUT=30000
SPRING_DATASOURCE_URL=jdbc:postgresql://[SUPABASE-HOST]:5432/postgres
SPRING_DATASOURCE_USERNAME=[SUPABASE-USER]
SPRING_DATASOURCE_PASSWORD=[SUPABASE-PASSWORD]
```

**Health Check Endpoint:** `/api/v1/ping` (ensures service stays warm)

### Python AI (Render / Fly.io)

```bash
cd python-ai

# For Render deployment
# Build command: pip install -r requirements.txt
# Start command: python main.py
```

**Environment Variables (Render):**
```
GROQ_API_KEY=your_key
GROQ_ANALYSIS_KEY=your_key
GROQ_LINKEDIN_KEY=your_key
GROQ_CHAT_KEY=your_key
```

**Dockerfile (if using Fly.io):**
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5001
CMD ["python", "main.py"]
```

### Database (Supabase)

1. Create Supabase project at [supabase.com](https://supabase.com/)
2. Run database schema from `database/schema.sql` in SQL Editor
3. Copy connection string from Project Settings → Database
4. Add connection details to backend environment variables

**No additional deployment needed** - Supabase is fully managed.

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
curl http://localhost:5001/analyze

# If not, start it
cd python-ai
python main.py
```

#### 3. Backend Cold Start Delays

**Cause:** Free-tier services (Render, Railway) sleep after inactivity

**Fix:**
- The wake-up ping feature (already implemented) handles this automatically
- Frontend sends `/api/v1/ping` request on page load
- Backend wakes up before user attempts analysis

#### 4. "Failed to fetch history" / Database Connection Error

**Cause:** PostgreSQL connection not configured or Supabase credentials incorrect

**Fix:**
1. Verify `application.properties` has correct Supabase connection string
2. Test connection:
   ```bash
   psql "postgresql://[USER]:[PASSWORD]@[HOST]:5432/postgres"
   ```
3. Ensure database schema is created (run `schema.sql`)

#### 5. Environment Variable Not Working

**Cause:** `.env` file not loaded or wrong format

**Fix for React:**
```bash
# Ensure .env is in frontend-react/ root
# Variable must start with VITE_
VITE_API_URL=http://localhost:8080/api/v1

# Restart dev server after changes
npm run dev
```

**Fix for Spring Boot:**
```bash
# Check application.properties syntax
# No quotes needed:
ai.service.url=http://localhost:5001
```

#### 6. "Empty or unreadable PDF"

**Cause:** Corrupted PDF or scanned image

**Fix:**
- Use a text-based PDF (not scanned)
- Try a different PDF
- Check PDF file size (< 10MB)

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
- Check that React `.env` points to correct backend URL
- Verify `VITE_API_URL` format (include `/api/v1` suffix)

**Database Migration Issues:**
```bash
# Reset Hibernate if schema changes
spring.jpa.hibernate.ddl-auto=create  # Caution: Drops tables!
# Then change back to:
spring.jpa.hibernate.ddl-auto=update
```

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
- **Database**: Use migrations for schema changes

---

## 📜 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Groq** for lightning-fast Llama 3.3 70B API
- **Firebase** for seamless authentication
- **Supabase** for managed PostgreSQL database
- **Lovable Design** for UI/UX inspiration
- **React** and **Spring Boot** communities

---

## 📧 Contact

**Project Maintainer**: Rohan Murlidhar Pawar  
**Email**: pawar.rohan.work@gmail.com  
**GitHub**: [@Rohan13253](https://github.com/Rohan13253)

---

## 🔮 Future Roadmap

- [x] PostgreSQL database integration for analysis history
- [x] LinkedIn profile analysis endpoint
- [x] Server wake-up optimization for cold starts
- [ ] Export analysis as PDF report
- [ ] GitHub repository analysis (auto-detect projects)
- [ ] Multi-language support (ES, FR, DE)
- [ ] Mobile app (React Native)
- [ ] Premium tier with advanced features
- [ ] Real-time collaboration (share analysis with mentors)
- [ ] Resume builder with AI suggestions
- [ ] Skill endorsements and peer reviews

---

**Made with ❤️ by the CareerArchitect Team**

**⭐ Star this repo if it helped you!**
