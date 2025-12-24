@echo off
setlocal enabledelayedexpansion

REM DashPoint AI Agent Startup Script for Windows
set "ROOT_DIR=%~dp0"
set "APP_DIR=%ROOT_DIR%app"
set "VENV_DIR=%ROOT_DIR%venv"

echo ==========================================
echo    DashPoint AI Agent v2.0.0
echo ==========================================
echo.

REM Verify Python availability
where python >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH.
    echo Install Python 3.9 or newer from https://www.python.org/downloads/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('python --version') do set "PY_VERSION=%%i"
echo Using %PY_VERSION%
echo.

if not exist "%VENV_DIR%" (
    echo Creating Python virtual environment...
    python -m venv "%VENV_DIR%"
    if errorlevel 1 (
        echo Error: Failed to create virtual environment.
        pause
        exit /b 1
    )
    echo Virtual environment created.
    echo.
)

echo Activating virtual environment...
call "%VENV_DIR%\Scripts\activate"
if errorlevel 1 (
    echo Error: Failed to activate virtual environment.
    pause
    exit /b 1
)

echo Upgrading pip (first run may take a few moments)...
python -m pip install --upgrade pip >nul

echo Installing required packages...
pip install -r "%ROOT_DIR%requirements.txt"
if errorlevel 1 (
    echo Error: Failed to install dependencies. Check your internet connection.
    pause
    exit /b 1
)

if not exist "%APP_DIR%\.env" if exist "%APP_DIR%\.env.example" (
    copy "%APP_DIR%\.env.example" "%APP_DIR%\.env" >nul
    echo Created app\.env from template. Update your API keys before using production features.
    echo.
)

echo Starting DashPoint AI Agent...
echo Server: http://localhost:8000
echo Docs:   http://localhost:8000/docs
echo.
pushd "%APP_DIR%"
python -m uvicorn main:app --host 0.0.0.0 --port 8000
popd

echo.
echo Agent stopped.
pause