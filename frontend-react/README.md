# CareerArchitect Frontend (React Service)

## Overview
Modern SaaS-style React frontend for intelligent career analysis platform.

## Port
**3000**

## Tech Stack
- React 18.2
- Vite (build tool)
- Recharts (data visualization)
- Lucide React (icon library)
- Modern CSS (no Tailwind needed)

## Design Theme
**Modern SaaS Dark Mode**
- Background: Dark Slate/Charcoal (`#0f172a`, `#1e293b`)
- Neon Cyan User Score: `#06b6d4`
- Neon Purple Market Demand: `#8b5cf6`
- Professional, Engineering-focused, Clean aesthetic

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Or with yarn
yarn install
```

## Running the Service

### Development Mode
```bash
npm run dev
```

The application will start on **http://localhost:3000** and automatically open in your browser.

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Features

### Resume Upload
- Drag-and-drop PDF upload
- File validation (PDF only, 10MB max)
- Visual feedback for drag states
- File size display

### Dashboard Visualization
- **Overall Score Card**: Shows candidate score out of 100
- **Candidate Info**: Displays extracted name
- **Missing Skills**: Lists skills to develop
- **Skill Radar Chart**: 
  - Neon Cyan: User's current skills
  - Neon Purple: Market demand
  - Interactive hover tooltips
- **Project Blueprint**:
  - Recommended project to build
  - Tech stack breakdown
  - Week-by-week learning roadmap

### Error Handling
- Network connection errors
- Backend service unavailability
- File validation errors
- User-friendly error messages

## API Integration

Communicates with Java backend at `http://localhost:8080/api/v1`

**Endpoint**: `POST /api/v1/analyze`
- Sends PDF file as multipart/form-data
- Receives JSON response with analysis

## File Structure
```
frontend-react/
├── public/             # Static assets
├── src/
│   ├── components/     # React components (future)
│   ├── styles/         # Additional styles (future)
│   ├── utils/          # Utility functions (future)
│   ├── App.jsx         # Main application component
│   ├── App.css         # Application styles
│   ├── main.jsx        # React entry point
│   └── index.css       # Global CSS reset
├── index.html          # HTML template
├── vite.config.js      # Vite configuration
├── package.json        # Dependencies
├── .eslintrc.cjs       # ESLint config
└── README.md           # This file
```

## Customization

### Change API URL
Edit `src/App.jsx`:
```javascript
const API_URL = 'http://your-backend-url:8080/api/v1';
```

### Modify Colors
Edit CSS variables in `src/App.css`:
```css
:root {
  --cyan-neon: #06b6d4;      /* User score color */
  --purple-neon: #8b5cf6;    /* Market demand color */
  --bg-primary: #0f172a;     /* Main background */
}
```

### Change Port
Edit `vite.config.js`:
```javascript
server: {
  port: 3000,  // Change to desired port
}
```

## Development

### Hot Module Replacement
Vite provides instant HMR - changes appear immediately without full page reload.

### Linting
```bash
npm run lint
```

### Code Formatting
The project uses ESLint for code quality. Configure in `.eslintrc.cjs`.

## Components Breakdown

### App.jsx
Main component managing:
- File upload state
- API communication
- Loading states
- Error handling
- Conditional rendering (upload vs dashboard)

### Key States
```javascript
const [file, setFile] = useState(null);      // Uploaded file
const [loading, setLoading] = useState(false); // Loading state
const [data, setData] = useState(null);      // Analysis results
const [error, setError] = useState(null);    // Error messages
const [dragActive, setDragActive] = useState(false); // Drag state
```

## Styling Architecture

**CSS Variables** for easy theming:
- Dark backgrounds with gradient
- Neon accents with glow effects
- Smooth transitions
- Responsive grid layouts
- Hover effects and animations

**No CSS Framework** - Pure custom CSS for:
- Complete control over styling
- Smaller bundle size
- No unnecessary utilities
- Pixel-perfect design

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Performance
- Lazy loading ready
- Code splitting via Vite
- Optimized production builds
- Minified CSS and JS

## Deployment

### Build for Production
```bash
npm run build
```

This creates an optimized `dist/` folder ready for deployment.

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy to Netlify
Drag and drop the `dist/` folder to Netlify dashboard.

### Environment Variables
Create `.env` file:
```
VITE_API_URL=http://localhost:8080/api/v1
```

Access in code:
```javascript
const API_URL = import.meta.env.VITE_API_URL;
```

## Troubleshooting

### Port Already in Use
```bash
# Change port in vite.config.js or run:
npm run dev -- --port 3001
```

### CORS Errors
Ensure Java backend CORS config includes:
```java
.allowedOrigins("http://localhost:3000")
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.2.0 | Core framework |
| react-dom | ^18.2.0 | DOM rendering |
| recharts | ^2.10.3 | Radar chart |
| lucide-react | ^0.294.0 | Icon library |
| vite | ^5.0.8 | Build tool |

## Next Steps
- [ ] Add authentication UI
- [ ] Implement user dashboard
- [ ] Add analysis history
- [ ] Export PDF reports
- [ ] Add dark/light mode toggle
- [ ] Implement responsive mobile design
- [ ] Add unit tests with Vitest
- [ ] Add E2E tests with Playwright

## Contributing
When adding new components:
1. Create in `src/components/`
2. Follow existing naming conventions
3. Use CSS modules or styled-components
4. Update this README

---

**Built with ⚛️ React and engineered for modern SaaS excellence**
