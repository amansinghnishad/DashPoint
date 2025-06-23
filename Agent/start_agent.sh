#!/bin/bash

# DashPoint AI Agent Startup Script

echo "Starting DashPoint AI Agent..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install/update requirements
echo "Installing dependencies..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Warning: .env file not found. Please copy .env.example to .env and configure it."
    cp .env.example .env
    echo "Created .env file from template. Please edit it with your API keys."
fi

# Start the agent
echo "Starting DashPoint AI Agent on port 8000..."
cd app
python main.py
