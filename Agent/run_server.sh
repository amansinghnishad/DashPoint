#!/bin/bash

# Script to run the FastAPI server for AI Summarization

# Set the directory
APP_DIR="$(dirname "$(readlink -f "$0")")/app"
cd "$(dirname "$(readlink -f "$0")")"

# Activate virtual environment
source venv/bin/activate || {
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    
    echo "Installing dependencies..."
    pip install fastapi uvicorn python-dotenv youtube-transcript-api google-genai
}

# Run the server
echo "Starting FastAPI server..."
cd app
python -m uvicorn main:app --host 0.0.0.0 --port 8000
