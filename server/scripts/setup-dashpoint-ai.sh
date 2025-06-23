#!/bin/bash

# DashPoint AI Agent - Complete Setup Script
# This script sets up and starts the DashPoint AI Agent integration

echo "🚀 DashPoint AI Agent Setup"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the server directory"
    exit 1
fi

# Check if DashPoint AI Agent directory exists
if [ ! -d "../Agent" ]; then
    print_error "DashPoint AI Agent directory not found at ../Agent"
    exit 1
fi

print_info "Starting DashPoint AI Agent integration setup..."

# Step 1: Check environment variables
print_info "Checking environment configuration..."

if [ ! -f ".env" ]; then
    print_warning ".env file not found, copying from .env.example"
    cp .env.example .env
fi

# Check if DASHPOINT_AI_AGENT_URL is configured
if ! grep -q "DASHPOINT_AI_AGENT_URL" .env; then
    print_warning "Adding DASHPOINT_AI_AGENT_URL to .env file"
    echo "" >> .env
    echo "# DashPoint AI Agent Configuration" >> .env
    echo "DASHPOINT_AI_AGENT_URL=http://localhost:8000" >> .env
fi

print_status "Environment configuration checked"

# Step 2: Install dependencies
print_info "Checking dependencies..."

if [ ! -d "node_modules" ]; then
    print_info "Installing Node.js dependencies..."
    npm install
fi

print_status "Dependencies checked"

# Step 3: Check DashPoint AI Agent
print_info "Checking DashPoint AI Agent..."

cd ../Agent

if [ ! -f "app/main.py" ]; then
    print_error "DashPoint AI Agent main.py not found"
    cd ../server
    exit 1
fi

# Check if Python environment exists
if [ ! -d "venv" ] && [ ! -d ".venv" ]; then
    print_warning "Python virtual environment not found"
    print_info "Creating Python virtual environment..."
    python -m venv venv
fi

# Activate virtual environment and install dependencies
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d ".venv" ]; then
    source .venv/bin/activate
fi

if [ -f "requirements.txt" ]; then
    print_info "Installing Python dependencies..."
    pip install -r requirements.txt
elif [ -f "app/requirements.txt" ]; then
    print_info "Installing Python dependencies from app/requirements.txt..."
    pip install -r app/requirements.txt
fi

cd ../server

print_status "DashPoint AI Agent checked"

# Step 4: Test DashPoint AI Agent connectivity
print_info "Testing DashPoint AI Agent connectivity..."

# Start the agent if it's not running
if ! curl -s http://localhost:8000/health > /dev/null 2>&1; then
    print_info "Starting DashPoint AI Agent..."
    
    # Run the startup script
    if [ -f "scripts/start-dashpoint-agent.sh" ]; then
        chmod +x scripts/start-dashpoint-agent.sh
        ./scripts/start-dashpoint-agent.sh
    else
        print_warning "Startup script not found, starting manually..."
        cd ../Agent
        if [ -f "run_server.sh" ]; then
            chmod +x run_server.sh
            ./run_server.sh &
        else
            python app/main.py &
        fi
        cd ../server
        
        # Wait for agent to start
        print_info "Waiting for DashPoint AI Agent to start..."
        for i in {1..30}; do
            if curl -s http://localhost:8000/health > /dev/null 2>&1; then
                break
            fi
            sleep 2
        done
    fi
fi

# Verify agent is running
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    print_status "DashPoint AI Agent is running and accessible"
else
    print_error "Failed to start DashPoint AI Agent"
    print_info "Please check the logs and try starting manually:"
    print_info "cd ../Agent && python app/main.py"
    exit 1
fi

# Step 5: Display completion message
echo ""
echo "🎉 DashPoint AI Agent Integration Setup Complete!"
echo "================================================="
echo ""
print_status "DashPoint AI Agent is running at: http://localhost:8000"
print_status "Available endpoints:"
echo "   - GET  http://localhost:8000/ (Root)"
echo "   - POST http://localhost:8000/chat (Chat with AI)"
echo "   - POST http://localhost:8000/summarize-text (Text Summarization)"
echo "   - POST http://localhost:8000/summarize-youtube (YouTube Summarization)"
echo "   - GET  http://localhost:8000/health (Health Check)"
echo ""
print_info "You can now start the server with AI integration:"
echo "   npm run dev-with-agent    # Development with auto-agent startup"
echo "   npm run start-with-agent  # Production with auto-agent startup"
echo "   npm run dev               # Development (manual agent startup)"
echo ""
print_info "Enhanced features now available:"
echo "   ✨ YouTube video AI summarization"
echo "   ✨ Content extraction with AI summaries"
echo "   ✨ Advanced text processing"
echo "   ✨ Intelligent chat interface"
echo ""
print_warning "Note: Old Universal AI services have been replaced with DashPoint AI Agent"
print_info "See docs/MIGRATION_GUIDE.md for migration details"
echo ""
print_status "Setup complete! Happy coding! 🚀"
