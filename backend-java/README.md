# CareerArchitect Backend Gateway (Java Service)

## Overview
Spring Boot microservice acting as a secure gateway between the React frontend and Python AI service.

## Port
**8080**

## Tech Stack
- Spring Boot 3.2.0
- Java 17
- Maven 3.8+
- Lombok
- RestTemplate

## Architecture Role
The Java backend serves as the **Gateway & Manager**:
- Receives file uploads from React frontend
- Validates and sanitizes inputs
- Forwards requests to Python AI service
- Handles errors gracefully
- Manages CORS and security

## Installation

### Prerequisites
- Java 17 or higher
- Maven 3.8+

### Setup
```bash
# Build the project
mvn clean install

# Skip tests during build (faster)
mvn clean install -DskipTests
```

## Running the Service

### Using Maven
```bash
mvn spring-boot:run
```

### Using Java JAR
```bash
# Build JAR
mvn clean package

# Run JAR
java -jar target/backend-java-1.0.0.jar
```

The service will start on **http://localhost:8080**

## API Endpoints

### POST /api/v1/analyze
Analyze a PDF resume.

**Request:**
```bash
curl -X POST http://localhost:8080/api/v1/analyze \
  -F "file=@resume.pdf"
```

**Response (Success):**
```json
{
  "status": "success",
  "candidate_profile": {...},
  "radar_chart_data": [...],
  "project_blueprint": {...}
}
```

**Response (Error):**
```json
{
  "status": "error",
  "message": "AI Service Unavailable",
  "error": "Cannot connect to Python AI service...",
  "timestamp": "2025-01-31T12:00:00",
  "path": "/api/v1/analyze"
}
```

### GET /api/v1/health
Health check with AI service connectivity status.

```bash
curl http://localhost:8080/api/v1/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "Backend Gateway",
  "version": "1.0.0",
  "port": 8080,
  "ai_service": "connected"
}
```

### GET /api/v1/
Service information and available endpoints.

## Configuration

Edit `src/main/resources/application.properties`:

```properties
# Change server port
server.port=8080

# Configure AI service URL
ai.service.url=http://localhost:5000

# Adjust file size limits
spring.servlet.multipart.max-file-size=10MB
```

## Error Handling

The service handles multiple error scenarios:

| Error | HTTP Status | Description |
|-------|-------------|-------------|
| Empty file | 400 | No file provided |
| Non-PDF file | 400 | Only PDF files accepted |
| File too large | 400 | Exceeds 10MB limit |
| AI service down | 503 | Python service unreachable |
| AI service error | 500 | Python service returned error |
| File read error | 500 | Cannot read uploaded file |

## CORS Configuration

Configured in `CorsConfig.java` to allow:
- http://localhost:3000 (React production)
- http://localhost:5173 (Vite dev server)

To add more origins, edit `CorsConfig.java`:
```java
.allowedOrigins(
    "http://localhost:3000",
    "https://your-domain.com"
)
```

## Logging

Logs include:
- File upload details (name, size)
- AI service communication
- Error details with stack traces (in DEBUG mode)

View logs in console or configure file logging:
```properties
logging.file.name=logs/backend.log
```

## Development

### IDE Setup
Import as Maven project in:
- IntelliJ IDEA
- Eclipse
- VS Code (with Java extensions)

### Hot Reload
Spring DevTools is not included by default. To enable:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <optional>true</optional>
</dependency>
```

### Testing
```bash
# Run tests
mvn test

# Run with coverage
mvn test jacoco:report
```

## Directory Structure
```
backend-java/
├── src/
│   ├── main/
│   │   ├── java/com/careerarchitect/backend/
│   │   │   ├── CareerArchitectApplication.java
│   │   │   ├── config/
│   │   │   │   └── CorsConfig.java
│   │   │   ├── controller/
│   │   │   │   └── AnalysisController.java
│   │   │   └── dto/
│   │   │       └── ErrorResponse.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│       └── java/
├── pom.xml
└── README.md
```

## Production Deployment

### Build Production JAR
```bash
mvn clean package -DskipTests
```

### Docker
```dockerfile
FROM openjdk:17-slim
WORKDIR /app
COPY target/backend-java-1.0.0.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```

### Environment Variables
```bash
export SERVER_PORT=8080
export AI_SERVICE_URL=http://ai-service:5000
```

## Dependencies

| Dependency | Purpose |
|-----------|---------|
| spring-boot-starter-web | REST API framework |
| lombok | Reduce boilerplate code |
| jackson-databind | JSON serialization |
| RestTemplate | HTTP client for AI service |

## Next Steps
- [ ] Add JWT authentication
- [ ] Implement request rate limiting
- [ ] Add database for analysis history
- [ ] Set up monitoring and metrics
- [ ] Add circuit breaker pattern
- [ ] Implement caching layer
