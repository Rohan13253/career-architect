# 🎨 CareerArchitect.ai - Visual Design Reference

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                         USER'S BROWSER                                       │
│                         http://localhost:3000                                │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │  REACT FRONTEND (Modern SaaS Dark Theme)                              │ │
│  │                                                                        │ │
│  │  • Upload Resume (Drag & Drop)                                        │ │
│  │  • Neon Cyan/Purple Radar Chart                                       │ │
│  │  • Dashboard with Stats Cards                                         │ │
│  │  • Project Blueprint Display                                          │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                         │
│                                    │ HTTP POST /api/v1/analyze               │
│                                    │ (multipart/form-data)                   │
└────────────────────────────────────┼─────────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                    JAVA SPRING BOOT GATEWAY                                  │
│                    http://localhost:8080                                     │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │  BACKEND SERVICES                                                      │ │
│  │                                                                        │ │
│  │  1. File Validation                                                    │ │
│  │     • Check PDF format                                                 │ │
│  │     • Verify size < 10MB                                               │ │
│  │                                                                        │ │
│  │  2. Request Forwarding                                                 │ │
│  │     • Forward to Python AI                                             │ │
│  │     • Handle timeouts                                                  │ │
│  │                                                                        │ │
│  │  3. Error Handling                                                     │ │
│  │     • 400: Bad Request                                                 │ │
│  │     • 503: Service Unavailable                                         │ │
│  │     • 500: Internal Error                                              │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                         │
│                                    │ HTTP POST /analyze                      │
│                                    │ (multipart/form-data)                   │
└────────────────────────────────────┼─────────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                    PYTHON FASTAPI AI ENGINE                                  │
│                    http://localhost:5000                                     │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │  AI PROCESSING PIPELINE                                                │ │
│  │                                                                        │ │
│  │  1. PDF Text Extraction                                                │ │
│  │     • PyPDF2 library                                                   │ │
│  │     • Page-by-page parsing                                             │ │
│  │     • Error handling for corrupt PDFs                                  │ │
│  │                                                                        │ │
│  │  2. Resume Analysis (MOCK MODE)                                        │ │
│  │     • Extract candidate name                                           │ │
│  │     • Generate skill scores                                            │ │
│  │     • Calculate market fit                                             │ │
│  │     • Create project recommendations                                   │ │
│  │                                                                        │ │
│  │  3. JSON Response Generation                                           │ │
│  │     • Mega-JSON structure                                              │ │
│  │     • Radar chart data                                                 │ │
│  │     • Project blueprint                                                │ │
│  │     • Learning milestones                                              │ │
│  │                                                                        │ │
│  │  TODO: Replace with Gemini API                                         │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Color System - Modern SaaS Dark Theme

### Primary Backgrounds
```
Background Primary:   #0f172a  ████████  (Very dark slate)
Background Secondary: #1e293b  ████████  (Dark slate)
Background Tertiary:  #334155  ████████  (Medium slate)
```

### Neon Accent Colors
```
Cyan Neon (User Score):     #06b6d4  ████████  (Bright cyan)
Purple Neon (Market):       #8b5cf6  ████████  (Vibrant purple)

Cyan Glow:   rgba(6, 182, 212, 0.2)   (Subtle cyan halo)
Purple Glow: rgba(139, 92, 246, 0.2)  (Subtle purple halo)
```

### Text Colors
```
Text Primary:    #f1f5f9  ████████  (Almost white)
Text Secondary:  #cbd5e1  ████████  (Light gray)
Text Muted:      #94a3b8  ████████  (Muted gray)
```

### Utility Colors
```
Success:  #10b981  ████████  (Green)
Error:    #ef4444  ████████  (Red)
Warning:  #f59e0b  ████████  (Amber)
```

### Border Colors
```
Border:       #334155  ████████  (Default border)
Border Hover: #475569  ████████  (Hover state)
```

---

## 📊 Radar Chart Configuration

### Visual Design
```
Grid Lines:      #334155 (Dark slate)
Angle Axis:      #94a3b8 (Muted gray text)
Radius Axis:     #475569 (Medium border)

User Score Area:
  - Stroke: #06b6d4 (Neon cyan)
  - Fill: #06b6d4 with 50% opacity
  - Stroke Width: 2px

Market Demand Area:
  - Stroke: #8b5cf6 (Neon purple)
  - Fill: #8b5cf6 with 30% opacity
  - Stroke Width: 2px
```

### Skills Measured
1. Java (Backend Development)
2. System Design (Architecture)
3. Cloud/DevOps (Infrastructure)
4. Frontend (UI Development)
5. AI/LLM (Machine Learning)

---

## 🧩 Component Hierarchy

### Frontend Structure
```
App
├── Header
│   ├── Logo Icon (Brain)
│   ├── Title (CareerArchitect.ai)
│   └── Subtitle
│
├── Upload Section (if no data)
│   ├── Dropzone
│   │   ├── Icon (Upload/CheckCircle)
│   │   ├── Title
│   │   ├── Description
│   │   └── File Input
│   ├── Action Buttons
│   │   ├── Analyze Button (Primary)
│   │   └── Cancel Button (Ghost)
│   └── Error Alert
│
└── Dashboard (if data exists)
    ├── Stats Grid
    │   ├── Overall Score Card
    │   ├── Candidate Name Card
    │   └── Missing Skills Card
    │
    ├── Content Grid
    │   ├── Radar Chart Card
    │   │   └── Recharts Radar Component
    │   │
    │   └── Project Blueprint Card
    │       ├── Header (Title + Tagline)
    │       ├── Description
    │       ├── Tech Stack Section
    │       └── Learning Milestones
    │
    └── Footer Actions
        └── Reset Button
```

---

## 📐 Layout Specifications

### Spacing Scale
```
xs:  0.25rem  (4px)
sm:  0.5rem   (8px)
md:  1rem     (16px)
lg:  1.5rem   (24px)
xl:  2rem     (32px)
2xl: 3rem     (48px)
3xl: 4rem     (64px)
```

### Border Radius
```
Small:  0.5rem   (8px)   - Buttons, tags
Medium: 0.75rem  (12px)  - Milestones
Large:  1rem     (16px)  - Cards, main sections
```

### Shadow Elevation
```
Small:  0 1px 2px 0 rgba(0, 0, 0, 0.3)
Medium: 0 4px 6px -1px rgba(0, 0, 0, 0.4)
Large:  0 10px 15px -3px rgba(0, 0, 0, 0.5)
XLarge: 0 20px 25px -5px rgba(0, 0, 0, 0.6)
```

### Typography Scale
```
Header Title:     3.5rem  (56px) - Bold 700
Subtitle:         1.25rem (20px) - Regular 400
Card Title:       1.5rem  (24px) - Bold 700
Section Title:    1.125rem(18px) - SemiBold 600
Body Text:        1rem    (16px) - Regular 400
Small Text:       0.875rem(14px) - Medium 500
```

---

## 🚀 Responsive Breakpoints

```css
/* Desktop First Approach */

/* Large Desktop: 1400px+ */
.content-wrapper {
  max-width: 1400px;
}

/* Desktop: 1024px - 1399px */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

/* Tablet: 768px - 1023px */
@media (max-width: 768px) {
  .header-title { font-size: 2.5rem; }
  .stats-grid { grid-template-columns: 1fr; }
}

/* Mobile: 480px - 767px */
@media (max-width: 480px) {
  .header-title { font-size: 2rem; }
  .upload-actions { flex-direction: column; }
}
```

---

## 🎯 Interactive States

### Button States
```
Primary Button:
  - Default: Cyan → Purple gradient
  - Hover: Translate Y(-2px) + Enhanced glow
  - Active: Scale(0.98)
  - Disabled: Opacity 50%, cursor not-allowed

Secondary Button:
  - Default: Tertiary background + border
  - Hover: Darker background
  - Active: Scale(0.98)

Ghost Button:
  - Default: Transparent
  - Hover: Tertiary background
  - Active: Scale(0.98)
```

### Card States
```
Stat Card:
  - Default: Medium shadow
  - Hover: Translate Y(-2px) + Large shadow + Border highlight

Tech Item:
  - Default: Secondary background
  - Hover: Tertiary background + Cyan border
```

### Upload Dropzone States
```
Default:    Dashed border, card background
Drag Over:  Cyan border, cyan glow background, scale(1.02)
Has File:   Success green border, success glow
```

---

## 💾 Data Structure Reference

### Mega-JSON Schema
```typescript
{
  status: "success" | "error",
  timestamp: string (ISO 8601),
  candidate_profile: {
    name: string,
    total_score: number (0-100),
    market_fit_level: "Beginner" | "Intermediate" | "Advanced",
    missing_skills: string[]
  },
  radar_chart_data: Array<{
    skill: string,
    userScore: number (0-100),
    marketScore: number (0-100)
  }>,
  project_blueprint: {
    title: string,
    tagline: string,
    description: string,
    tech_stack: Array<{
      name: string,
      usage: string
    }>,
    learning_milestones: Array<{
      week: number,
      task: string
    }>
  }
}
```

---

## 🔧 Build Configuration

### Port Assignments
| Service | Port | Purpose |
|---------|------|---------|
| React   | 3000 | User interface |
| Java    | 8080 | API gateway |
| Python  | 5000 | AI processing |

### CORS Configuration
```
React → Java:   Allowed (CORS configured)
Java → Python:  Same origin (backend-to-backend)
```

---

## 📝 File Naming Conventions

### JavaScript/React
- Components: PascalCase (e.g., `App.jsx`, `Dashboard.jsx`)
- Utilities: camelCase (e.g., `apiClient.js`)
- Styles: Match component (e.g., `App.css`)

### Java
- Classes: PascalCase (e.g., `AnalysisController.java`)
- Packages: lowercase (e.g., `com.careerarchitect.backend`)

### Python
- Files: snake_case (e.g., `main.py`, `resume_parser.py`)
- Functions: snake_case (e.g., `extract_text_from_pdf`)

---

**This reference guide ensures visual consistency across the entire application.**
