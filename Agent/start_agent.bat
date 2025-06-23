@echo off
REM DashPoint AI Agent Startup Script for Windows

echo Starting DashPoint AI Agent...

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate

REM Install/update requirements
echo Installing dependencies...
pip install -r requirements.txt

REM Check if .env file exists
if not exist ".env" (
    echo Warning: .env file not found. Please copy .env.example to .env and configure it.
    copy .env.example .env
    echo Created .env file from template. Please edit it with your API keys.
)

REM Start the agent
echo Starting DashPoint AI Agent on port 8000...
cd app
python main.py

pause



@REM .\venv\Scripts\python.exe app\main.py