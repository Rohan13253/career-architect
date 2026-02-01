# 🏗️ CareerArchitect.ai - Complete System

> **Intelligent Career Engineering Platform** using Dual-Brain Microservices Architecture

## 📋 Table of Contents
- [Architecture Overview](#architecture-overview)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Services](#services)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Architecture Overview

```
┌─────────────────────┐         ┌──────────────────────┐         ┌─────────────────────┐
│                     │         │                      │         │                     │
│  React Frontend     │────────▶│  Java Spring Boot    │────────▶│  Python FastAPI     │
│  (Port 3000)        │         │  Gateway (Port 8080) │         │  AI Engine (5000)   │
│                     │         │                      │         │                     │
│  • Upload UI        │  HTTP   │  • File Validation   │  HTTP   │  • PDF Parsing      │
│  • Radar Chart      │  POST   │  • Request Forward   │  POST   │  • AI Analysis      │
│  • Dashboard        │         │  • Error Handling    │         │  • JSON Response    │
│  • Modern Dark UI   │         │  • CORS Management   │         │  • Mock AI (MVP)    │
│                     │         │                      │         │                     │
└─────────────────────┘         └──────────────────────┘         └─────────────────────┘
```

### Data Flow
1. User uploads PDF resume via React frontend
2. Frontend sends file to Java backend (`POST /api/v1/analyze`)
3. Java validates file and forwards to Python AI service
4. Python extracts text using PyPDF2 and generates analysis
5. Python returns structured JSON ("Mega-JSON" format)
6. Java passes response back to React
7. React renders interactive dashboard with radar chart

---

## ⚡ Quick Start

### Prerequisites
- **Java 17+** ([Download](https://adoptium.net/))
- **Maven 3.8+** ([Download](https://maven.apache.org/download.cgi))
- **Python 3.9+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** ([Download](https://nodejs.org/))

### Installation (3 Steps)

#### 1️⃣ Start Python AI Service
```bash
cd ai-python
pip install -r requirements.txt
python main.py
```
✅ Running on **http://localhost:5000**

#### 2️⃣ Start Java Backend
```bash
cd backend-java
mvn clean install
mvn spring-boot:run
```
✅ Running on **http://localhost:8080**

#### 3️⃣ Start React Frontend
```bash
cd frontend-react
npm install
npm run dev
```
✅ Running on **http://localhost:3000**

### 🎉 Ready!
Open your browser to **http://localhost:3000** and upload a PDF resume!

---

## 📁 Project Structure

```
career-architect/
│
├── ai-python/                    # Python FastAPI Microservice
│   ├── main.py                   # FastAPI application
│   ├── requirements.txt          # Python dependencies
│   └── README.md                 # Python service docs
│
├── backend-java/                 # Java Spring Boot Gateway
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/careerarchitect/backend/
│   │       │       ├── CareerArchitectApplication.java
│   │       │       ├── config/
│   │       │       │   └── CorsConfig.java
│   │       │       ├── controller/
│   │       │       │   └── AnalysisController.java
│   │       │       └── dto/
│   │       │           └── ErrorResponse.java
│   │       └── resources/
│   │           └── application.properties
│   ├── pom.xml                   # Maven configuration
│   └── README.md                 # Java service docs
│
├── frontend-react/               # React Vite Application
│   ├── src/
│   │   ├── App.jsx               # Main application
│   │   ├── App.css               # Modern Dark Theme styles
│   │   ├── main.jsx              # React entry point
│   │   └── index.css             # Global styles
│   ├── index.html                # HTML template
│   ├── vite.config.js            # Vite configuration
│   ├── package.json              # NPM dependencies
│   └── README.md                 # React service docs
│
├── README.md                     # This file
└── start-all.sh                  # Automated startup script
```

---

## 🔧 Services

### 1. Python AI Engine (Port 5000)

**Technology**: FastAPI, PyPDF2, Uvicorn  
**Purpose**: Resume analysis and AI intelligence

**Key Endpoints**:
- `POST /analyze` - Analyze PDF resume
- `GET /health` - Service health check
- `GET /docs` - Interactive API documentation

**Current Mode**: MOCK (returns hardcoded responses)  
**Future**: Integrate Gemini API for real AI analysis

[📖 Full Documentation](./ai-python/README.md)

---

### 2. Java Backend Gateway (Port 8080)

**Technology**: Spring Boot 3.2, Maven, Lombok  
**Purpose**: Secure gateway and request router

**Key Endpoints**:
- `POST /api/v1/analyze` - Upload resume for analysis
- `GET /api/v1/health` - Health check with AI service status
- `GET /api/v1/` - Service information

**Features**:
- File validation (PDF only, 10MB max)
- CORS configuration
- Comprehensive error handling
- AI service connectivity check

[📖 Full Documentation](./backend-java/README.md)

---

### 3. React Frontend (Port 3000)

**Technology**: React 18, Vite, Recharts, Lucide Icons  
**Purpose**: User interface and visualization

**Design Theme**: Modern SaaS Dark Mode
- Charcoal backgrounds (`#0f172a`, `#1e293b`)
- Neon Cyan user scores (`#06b6d4`)
- Neon Purple market demand (`#8b5cf6`)
- Professional, engineering-focused aesthetic

**Features**:
- Drag-and-drop PDF upload
- Interactive radar chart
- Real-time loading states
- Comprehensive error handling
- Responsive design

[📖 Full Documentation](./frontend-react/README.md)

---

## 🧪 Testing

### Health Checks

```bash
# Test Python service
curl http://localhost:5000/health

# Test Java service
curl http://localhost:8080/api/v1/health
```

### End-to-End Test

```bash
# Upload sample resume (replace with actual PDF path)
curl -X POST http://localhost:8080/api/v1/analyze \
  -F "file=@sample-resume.pdf"
```

### Expected Response Format

```json
{
  "status": "success",
  "timestamp": "2025-01-31T12:00:00",
  "candidate_profile": {
    "name": "John Doe",
    "total_score": 72,
    "market_fit_level": "Intermediate",
    "missing_skills": ["Docker", "Kubernetes", "Redis"]
  },
  "radar_chart_data": [
    { "skill": "Java", "userScore": 85, "marketScore": 90 },
    { "skill": "System Design", "userScore": 40, "marketScore": 85 },
    { "skill": "Cloud/DevOps", "userScore": 20, "marketScore": 80 },
    { "skill": "Frontend", "userScore": 75, "marketScore": 70 },
    { "skill": "AI/LLM", "userScore": 30, "marketScore": 95 }
  ],
  "project_blueprint": {
    "title": "Real-Time Stock Ticker System",
    "tagline": "Prove your Microservices mastery by handling 10k events/sec.",
    "description": "Build a distributed system...",
    "tech_stack": [...],
    "learning_milestones": [...]
  }
}
```

---

## 🚀 Deployment

### Local Development
Already covered in Quick Start section above.

### Production Deployment

#### Frontend (Vercel/Netlify)
```bash
cd frontend-react
npm run build
# Upload dist/ folder to hosting platform
```

#### Backend (AWS/Railway/Render)

**Java Backend**:
```bash
cd backend-java
mvn clean package
# Deploy target/backend-java-1.0.0.jar
```

**Python AI Service**:
```bash
cd ai-python
# Create Dockerfile
docker build -t career-architect-ai .
docker run -p 5000:5000 career-architect-ai
```

#### Environment Configuration

**Java** (`application.properties`):
```properties
ai.service.url=https://your-python-service.com
server.port=8080
```

**React** (`.env`):
```
VITE_API_URL=https://your-java-backend.com/api/v1
```

---

## 🐛 Troubleshooting

### Issue: "Port already in use"

**Solution**: Kill the process or change port

```bash
# Find process
lsof -i :5000  # or :8080 or :3000

# Kill process
kill -9 <PID>
```

### Issue: "AI Service Unavailable"

**Symptoms**: Frontend shows "503 Service Unavailable"  
**Solution**: Ensure Python service is running

```bash
cd ai-python
python main.py
```

Verify: `curl http://localhost:5000/health`

### Issue: CORS Error in Browser

**Symptoms**: Console shows "CORS policy" error  
**Solution**: Check Java `CorsConfig.java` includes your frontend URL

```java
.allowedOrigins(
    "http://localhost:3000",
    "http://localhost:5173"
)
```

### Issue: File Upload Fails

**Possible Causes**:
1. File is not a PDF
2. File exceeds 10MB
3. Backend not running

**Solution**: 
- Check file type and size
- Verify backend is running: `curl http://localhost:8080/api/v1/health`

### Issue: "Cannot find module" (React)

**Solution**: Reinstall dependencies

```bash
cd frontend-react
rm -rf node_modules package-lock.json
npm install
```

### Issue: Maven Build Fails (Java)

**Solution**: Clean and rebuild

```bash
cd backend-java
mvn clean
mvn install -DskipTests
```

---

## 📊 System Configuration

### Port Summary
| Service | Port | URL |
|---------|------|-----|
| Python AI | 5000 | http://localhost:5000 |
| Java Backend | 8080 | http://localhost:8080 |
| React Frontend | 3000 | http://localhost:3000 |

### File Size Limits
- **Maximum Upload**: 10MB
- **Supported Format**: PDF only

### Timeout Settings
- **AI Service Timeout**: 30 seconds (configurable in `application.properties`)

---

## 🎨 Design System

### Color Palette
```css
/* Dark Backgrounds */
--bg-primary: #0f172a;
--bg-secondary: #1e293b;
--bg-tertiary: #334155;

/* Neon Accents */
--cyan-neon: #06b6d4;      /* User scores */
--purple-neon: #8b5cf6;    /* Market demand */

/* Text */
--text-primary: #f1f5f9;
--text-secondary: #cbd5e1;
--text-muted: #94a3b8;
```

### Typography
- **Font**: System font stack (San Francisco, Segoe UI, Roboto)
- **Headers**: 700 weight
- **Body**: 400 weight
- **Line Height**: 1.6

---

## 📚 Next Steps

### Phase 2 Enhancements
- [ ] Replace mock data with real Gemini API
- [ ] Add user authentication (JWT)
- [ ] Implement analysis history database
- [ ] Add PDF export of results
- [ ] LinkedIn profile import
- [ ] Job matching algorithm
- [ ] Email notifications
- [ ] Rate limiting and caching

### Advanced Features
- [ ] Real-time collaboration
- [ ] Team dashboards
- [ ] Custom skill taxonomies
- [ ] Industry-specific analysis
- [ ] Multi-language support

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - feel free to use this project for learning and development.

---

## 🆘 Support

For issues or questions:
1. Check service-specific READMEs
2. Review troubleshooting section
3. Check service health endpoints
4. Review logs in each service terminal

---

**Built with ❤️ using the Dual-Brain Microservices Architecture**

*Python FastAPI • Java Spring Boot • React*
