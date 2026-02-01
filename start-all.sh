#!/bin/bash

# CareerArchitect.ai - Automated Startup Script
# Starts all three services in separate terminals

echo "╔════════════════════════════════════════════════════════╗"
echo "║     CareerArchitect.ai - Starting All Services        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed.${NC}"
    echo "   Please install Python 3.9+ from: https://www.python.org/downloads/"
    exit 1
fi

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java is not installed.${NC}"
    echo "   Please install Java 17+ from: https://adoptium.net/"
    exit 1
fi

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo -e "${RED}❌ Maven is not installed.${NC}"
    echo "   Please install Maven 3.8+ from: https://maven.apache.org/download.cgi"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed.${NC}"
    echo "   Please install Node.js 18+ from: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites found!${NC}"
echo ""

# Get the absolute path of the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Function to open new terminal tabs (macOS)
open_tab_mac() {
    local dir="$1"
    local cmd="$2"
    local title="$3"
    
    osascript <<EOF
tell application "Terminal"
    activate
    tell application "System Events" to keystroke "t" using {command down}
    delay 0.5
    do script "cd \"$SCRIPT_DIR/$dir\" && echo -e \"${BLUE}[$title]${NC}\" && $cmd" in front window
end tell
EOF
}

# Function to open new terminal tabs (Linux - gnome-terminal)
open_tab_linux() {
    local dir="$1"
    local cmd="$2"
    local title="$3"
    
    gnome-terminal --tab --title="$title" --working-directory="$SCRIPT_DIR/$dir" -- bash -c "echo -e '${BLUE}[$title]${NC}' && $cmd; exec bash"
}

# Function to open new terminal tabs (Windows Git Bash)
open_tab_windows() {
    local dir="$1"
    local cmd="$2"
    local title="$3"
    
    start bash -c "cd '$SCRIPT_DIR/$dir' && echo '[$title]' && $cmd && read -p 'Press Enter to close...'"
}

echo -e "${YELLOW}📦 Installing dependencies...${NC}"
echo ""

# Install Python dependencies
echo -e "${BLUE}[1/3] Installing Python dependencies...${NC}"
cd "$SCRIPT_DIR/ai-python"
pip install -r requirements.txt > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✓ Python dependencies installed${NC}"
else
    echo -e "${YELLOW}   ⚠ Python dependencies may already be installed${NC}"
fi

# Install Node dependencies
echo -e "${BLUE}[2/3] Installing Node dependencies (this may take a minute)...${NC}"
cd "$SCRIPT_DIR/frontend-react"
npm install > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✓ Node dependencies installed${NC}"
else
    echo -e "${YELLOW}   ⚠ Node dependencies may already be installed${NC}"
fi

# Maven build
echo -e "${BLUE}[3/3] Building Java backend...${NC}"
cd "$SCRIPT_DIR/backend-java"
mvn clean install -DskipTests > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✓ Java backend built successfully${NC}"
else
    echo -e "${YELLOW}   ⚠ Java backend build may have warnings (continuing...)${NC}"
fi

echo ""
echo -e "${GREEN}🎬 Starting services in separate terminals...${NC}"
echo ""

# Detect OS and open terminals accordingly
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo -e "${BLUE}Detected: macOS${NC}"
    open_tab_mac "ai-python" "python3 main.py" "Python AI Service"
    sleep 2
    open_tab_mac "backend-java" "mvn spring-boot:run" "Java Backend"
    sleep 3
    open_tab_mac "frontend-react" "npm run dev" "React Frontend"
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    echo -e "${BLUE}Detected: Linux${NC}"
    open_tab_linux "ai-python" "python3 main.py" "Python AI Service"
    sleep 2
    open_tab_linux "backend-java" "mvn spring-boot:run" "Java Backend"
    sleep 3
    open_tab_linux "frontend-react" "npm run dev" "React Frontend"
    
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    # Windows Git Bash
    echo -e "${BLUE}Detected: Windows${NC}"
    open_tab_windows "ai-python" "python main.py" "Python AI Service"
    sleep 2
    open_tab_windows "backend-java" "mvn spring-boot:run" "Java Backend"
    sleep 3
    open_tab_windows "frontend-react" "npm run dev" "React Frontend"
    
else
    echo -e "${YELLOW}⚠️  Automatic terminal opening not supported on this OS.${NC}"
    echo ""
    echo "Please manually run the following commands in separate terminals:"
    echo ""
    echo -e "${BLUE}Terminal 1 (Python AI):${NC}"
    echo "   cd ai-python && python3 main.py"
    echo ""
    echo -e "${BLUE}Terminal 2 (Java Backend):${NC}"
    echo "   cd backend-java && mvn spring-boot:run"
    echo ""
    echo -e "${BLUE}Terminal 3 (React Frontend):${NC}"
    echo "   cd frontend-react && npm run dev"
    exit 0
fi

sleep 2

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║              🎉 All Services Starting!                ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}📍 Service URLs:${NC}"
echo -e "   ${BLUE}🐍 Python AI Service:${NC}  http://localhost:5000"
echo -e "   ${BLUE}☕ Java Backend:${NC}       http://localhost:8080"
echo -e "   ${BLUE}⚛️  React Frontend:${NC}     http://localhost:3000"
echo ""
echo -e "${YELLOW}🌐 Open your browser to:${NC} ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "${BLUE}💡 Tip:${NC} Check each terminal window for service logs"
echo -e "${BLUE}💡 Tip:${NC} Press Ctrl+C in each terminal to stop services"
echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║            Ready to Architect Your Career! 🚀         ║"
echo "╚════════════════════════════════════════════════════════╝"
