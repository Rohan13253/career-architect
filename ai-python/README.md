# CareerArchitect AI Engine (Python Service)

## Overview
FastAPI microservice for intelligent resume analysis and career guidance.

## Port
**5000**

## Tech Stack
- FastAPI 0.104
- Uvicorn (ASGI server)
- PyPDF2 (PDF parsing)
- Python 3.9+

## Installation

### Prerequisites
- Python 3.9 or higher
- pip package manager

### Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Or use virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Running the Service

```bash
python main.py
```

The service will start on **http://localhost:5000**

## API Endpoints

### POST /analyze
Analyze a PDF resume and return structured insights.

**Request:**
```bash
curl -X POST http://localhost:5000/analyze \
  -F "file=@resume.pdf"
```

**Response:**
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
  "radar_chart_data": [...],
  "project_blueprint": {...}
}
```

### GET /health
Health check endpoint.

```bash
curl http://localhost:5000/health
```

### GET /docs
Interactive API documentation (Swagger UI).

Visit: **http://localhost:5000/docs**

## Development

### MOCK Mode
Currently running in MOCK mode - returns hardcoded intelligent responses.

To integrate real AI (Gemini API):
1. Add `google-generativeai` to requirements.txt
2. Update `analyze_resume_text()` function in main.py
3. Add API key configuration

### Logging
Logs are output to console with timestamps. Configure in `main.py`:
```python
logging.basicConfig(level=logging.INFO)
```

## CORS Configuration
Allows requests from:
- http://localhost:8080 (Java Backend)
- http://localhost:3000 (React Frontend)
- http://localhost:5173 (Vite Dev Server)

## Error Handling
- **400**: Invalid file type or parsing error
- **500**: Internal server error
- All errors return JSON with `detail` field

## Directory Structure
```
ai-python/
├── main.py              # FastAPI application
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

## Testing

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test with sample PDF
curl -X POST http://localhost:5000/analyze \
  -F "file=@sample-resume.pdf"
```

## Production Deployment

### Docker
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "main.py"]
```

### Environment Variables
```bash
export PORT=5000
export LOG_LEVEL=info
```

## Next Steps
- [ ] Integrate Gemini API for real analysis
- [ ] Add resume parsing for skills extraction
- [ ] Implement caching with Redis
- [ ] Add rate limiting
- [ ] Set up monitoring and metrics
