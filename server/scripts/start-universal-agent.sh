#!/bin/bash

# Universal AI Agent Health Check and Startup Script
# This script ensures the Universal AI Agent is running before starting the main server

UNIVERSAL_AI_AGENT_URL="http://localhost:8000"
UNIVERSAL_AI_AGENT_DIR="../universalAgent"
LOG_FILE="universal-ai-agent.log"

echo "🚀 Starting Universal AI Agent Health Check..."

# Function to check if Universal AI Agent is running
check_agent_health() {
    curl -s "${UNIVERSAL_AI_AGENT_URL}/health" > /dev/null 2>&1
    return $?
}

# Function to start Universal AI Agent
start_agent() {
    echo "📡 Starting Universal AI Agent..."
    cd "$UNIVERSAL_AI_AGENT_DIR"
    
    # Check if run_server.sh exists and is executable
    if [ -f "run_server.sh" ]; then
        chmod +x run_server.sh
        ./run_server.sh > "../server/$LOG_FILE" 2>&1 &
        AGENT_PID=$!
        echo "🔧 Universal AI Agent started with PID: $AGENT_PID"
        cd - > /dev/null
        return 0
    else
        echo "❌ run_server.sh not found in $UNIVERSAL_AI_AGENT_DIR"
        cd - > /dev/null
        return 1
    fi
}

# Function to wait for agent to be ready
wait_for_agent() {
    echo "⏳ Waiting for Universal AI Agent to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if check_agent_health; then
            echo "✅ Universal AI Agent is ready!"
            return 0
        fi
        
        echo "🔄 Attempt $attempt/$max_attempts - Agent not ready yet..."
        sleep 2
        ((attempt++))
    done
    
    echo "❌ Universal AI Agent failed to start after $max_attempts attempts"
    return 1
}

# Main execution
if check_agent_health; then
    echo "✅ Universal AI Agent is already running"
else
    echo "🔄 Universal AI Agent is not running, starting it..."
    
    if start_agent; then
        if wait_for_agent; then
            echo "🎉 Universal AI Agent is now running and ready!"
        else
            echo "💥 Failed to start Universal AI Agent"
            echo "📋 Check the logs in $LOG_FILE for more details"
            exit 1
        fi
    else
        echo "💥 Failed to start Universal AI Agent"
        exit 1
    fi
fi

echo "🚀 Universal AI Agent health check completed successfully!"
echo "🌐 Agent is available at: $UNIVERSAL_AI_AGENT_URL"
echo ""
echo "Available endpoints:"
echo "  - GET  $UNIVERSAL_AI_AGENT_URL/ (Root)"
echo "  - POST $UNIVERSAL_AI_AGENT_URL/chat (Chat with AI)"
echo "  - POST $UNIVERSAL_AI_AGENT_URL/summarize-text (Text Summarization)"
echo "  - POST $UNIVERSAL_AI_AGENT_URL/summarize-youtube (YouTube Summarization)"
echo "  - GET  $UNIVERSAL_AI_AGENT_URL/health (Health Check)"
