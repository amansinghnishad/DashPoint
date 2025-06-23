#!/bin/bash

# DashPoint AI Agent Health Check and Startup Script
# This script ensures the DashPoint AI Agent is running before starting the main server

DASHPOINT_AI_AGENT_URL="http://localhost:8000"
DASHPOINT_AI_AGENT_DIR="../Agent"
LOG_FILE="dashpoint-ai-agent.log"

echo "🚀 Starting DashPoint AI Agent Health Check..."

# Function to check if DashPoint AI Agent is running
check_agent_health() {
    curl -s "${DASHPOINT_AI_AGENT_URL}/health" > /dev/null 2>&1
    return $?
}

# Function to start DashPoint AI Agent
start_agent() {
    echo "📡 Starting DashPoint AI Agent..."
    cd "$DASHPOINT_AI_AGENT_DIR"
    
    # Check if run_server.sh exists and is executable
    if [ -f "run_server.sh" ]; then
        chmod +x run_server.sh
        ./run_server.sh > "../server/$LOG_FILE" 2>&1 &
        AGENT_PID=$!
        echo "🔧 DashPoint AI Agent started with PID: $AGENT_PID"
        cd - > /dev/null
        return 0
    else
        echo "❌ run_server.sh not found in $DASHPOINT_AI_AGENT_DIR"
        cd - > /dev/null
        return 1
    fi
}

# Function to wait for agent to be ready
wait_for_agent() {
    echo "⏳ Waiting for DashPoint AI Agent to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if check_agent_health; then
            echo "✅ DashPoint AI Agent is ready!"
            return 0
        fi
        
        echo "🔄 Attempt $attempt/$max_attempts - Agent not ready yet..."
        sleep 2
        ((attempt++))
    done
    
    echo "❌ DashPoint AI Agent failed to start after $max_attempts attempts"
    return 1
}

# Main execution
if check_agent_health; then
    echo "✅ DashPoint AI Agent is already running"
else
    echo "🔄 DashPoint AI Agent is not running, starting it..."
    
    if start_agent; then
        if wait_for_agent; then
            echo "🎉 DashPoint AI Agent is now running and ready!"
        else
            echo "💥 Failed to start DashPoint AI Agent"
            echo "📋 Check the logs in $LOG_FILE for more details"
            exit 1
        fi
    else
        echo "💥 Failed to start DashPoint AI Agent"
        exit 1
    fi
fi

echo "🚀 DashPoint AI Agent health check completed successfully!"
echo "🌐 Agent is available at: $DASHPOINT_AI_AGENT_URL"
echo ""
echo "Available endpoints:"
echo "  - GET  $DASHPOINT_AI_AGENT_URL/ (Root)"
echo "  - POST $DASHPOINT_AI_AGENT_URL/chat (Chat with AI)"
echo "  - POST $DASHPOINT_AI_AGENT_URL/summarize-text (Text Summarization)"
echo "  - POST $DASHPOINT_AI_AGENT_URL/summarize-youtube (YouTube Summarization)"
echo "  - GET  $DASHPOINT_AI_AGENT_URL/health (Health Check)"
