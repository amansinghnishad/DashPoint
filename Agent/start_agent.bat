@echo off
REM DashPoint AI Agent Startup Script for Windows

echo ==========================================
echo    DashPoint AI Agent v2.0.0
echo ==========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.8+ and add it to your PATH
    echo Download from: https://python.org/downloads/
    pause
    exit /b 1
)

echo Python version:
python --version
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo Error: Failed to create virtual environment
        pause
        exit /b 1
    )
    echo Virtual environment created successfully.
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate
if %errorlevel% neq 0 (
    echo Error: Failed to activate virtual environment
    pause
    exit /b 1
)

REM Upgrade pip to latest version
echo Upgrading pip...
python -m pip install --upgrade pip --quiet

REM Install/update dependencies
echo Installing/updating dependencies...
pip install -r requirements.txt --quiet
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    echo Please check your internet connection and try again
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist "app\.env" (
    echo.
    echo ==========================================
    echo         CONFIGURATION REQUIRED
    echo ==========================================
    echo .env file not found in app directory!
    echo.
    echo Creating .env file from template...
    copy "app\.env.example" "app\.env" >nul
    echo.
    echo Please edit app\.env and configure your API keys:
    echo   - GEMINI_API_KEY: Required for AI features
    echo   - YOUTUBE_API_KEY: Required for YouTube video analysis
    echo.
    echo The agent will continue starting, but some features may not work
    echo without proper API key configuration.
    echo.
    timeout /t 5 >nul
)

REM Start the agent
echo.
echo ==========================================
echo         STARTING AGENT SERVER
echo ==========================================
echo.
echo DashPoint AI Agent is starting...
echo Server will be available at: http://localhost:8000
echo API documentation: http://localhost:8000/docs
echo Health check: http://localhost:8000/health
echo.
echo Press Ctrl+C to stop the agent
echo.

cd app
python main.py

echo.
echo Agent stopped.
pause