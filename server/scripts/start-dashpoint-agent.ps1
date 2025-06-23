# DashPoint AI Agent Health Check and Startup Script (PowerShell)
# This script ensures the DashPoint AI Agent is running before starting the main server

$DASHPOINT_AI_AGENT_URL = "http://localhost:8000"
$DASHPOINT_AI_AGENT_DIR = "..\Agent"
$LOG_FILE = "dashpoint-ai-agent.log"

Write-Host "🚀 Starting DashPoint AI Agent Health Check..." -ForegroundColor Green

# Function to check if DashPoint AI Agent is running
function Test-AgentHealth {
    try {
        $response = Invoke-WebRequest -Uri "$DASHPOINT_AI_AGENT_URL/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
        return $response.StatusCode -eq 200
    }
    catch {
        return $false
    }
}

# Function to start DashPoint AI Agent
function Start-Agent {
    Write-Host "📡 Starting DashPoint AI Agent..." -ForegroundColor Yellow
    
    $originalLocation = Get-Location
    Set-Location $DASHPOINT_AI_AGENT_DIR
    
    # Check if run_server.sh exists
    if (Test-Path "run_server.sh") {
        Write-Host "🐧 Using run_server.sh (Linux/WSL compatibility)..." -ForegroundColor Cyan
        # For Windows, we'll run the Python server directly
        if (Test-Path "app\main.py") {
            Write-Host "🐍 Starting Python server directly..." -ForegroundColor Cyan
            $process = Start-Process -FilePath "python" -ArgumentList "app\main.py" -RedirectStandardOutput "..\server\$LOG_FILE" -RedirectStandardError "..\server\$LOG_FILE" -PassThru -WindowStyle Hidden
            Write-Host "🔧 DashPoint AI Agent started with PID: $($process.Id)" -ForegroundColor Green
            Set-Location $originalLocation
            return $true
        }
        else {
            Write-Host "❌ app\main.py not found in $DASHPOINT_AI_AGENT_DIR" -ForegroundColor Red
            Set-Location $originalLocation
            return $false
        }
    }
    else {
        Write-Host "❌ run_server.sh not found in $DASHPOINT_AI_AGENT_DIR, trying direct Python execution..." -ForegroundColor Yellow
        if (Test-Path "app\main.py") {
            Write-Host "🐍 Starting Python server directly..." -ForegroundColor Cyan
            $process = Start-Process -FilePath "python" -ArgumentList "app\main.py" -RedirectStandardOutput "..\server\$LOG_FILE" -RedirectStandardError "..\server\$LOG_FILE" -PassThru -WindowStyle Hidden
            Write-Host "🔧 DashPoint AI Agent started with PID: $($process.Id)" -ForegroundColor Green
            Set-Location $originalLocation
            return $true
        }
        else {
            Write-Host "❌ app\main.py not found" -ForegroundColor Red
            Set-Location $originalLocation
            return $false
        }
    }
}

# Function to wait for agent to be ready
function Wait-ForAgent {
    Write-Host "⏳ Waiting for DashPoint AI Agent to be ready..." -ForegroundColor Yellow
    $maxAttempts = 30
    $attempt = 1
    
    while ($attempt -le $maxAttempts) {
        if (Test-AgentHealth) {
            Write-Host "✅ DashPoint AI Agent is ready!" -ForegroundColor Green
            return $true
        }
        
        Write-Host "🔄 Attempt $attempt/$maxAttempts - Agent not ready yet..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        $attempt++
    }
    
    Write-Host "❌ DashPoint AI Agent failed to start after $maxAttempts attempts" -ForegroundColor Red
    return $false
}

# Main execution
if (Test-AgentHealth) {
    Write-Host "✅ DashPoint AI Agent is already running" -ForegroundColor Green
}
else {
    Write-Host "🔄 DashPoint AI Agent is not running, starting it..." -ForegroundColor Yellow
    
    if (Start-Agent) {
        if (Wait-ForAgent) {
            Write-Host "🎉 DashPoint AI Agent is now running and ready!" -ForegroundColor Green
        }
        else {
            Write-Host "💥 Failed to start DashPoint AI Agent" -ForegroundColor Red
            Write-Host "📋 Check the logs in $LOG_FILE for more details" -ForegroundColor Yellow
            exit 1
        }
    }
    else {
        Write-Host "💥 Failed to start DashPoint AI Agent" -ForegroundColor Red
        exit 1
    }
}

Write-Host "🚀 DashPoint AI Agent health check completed successfully!" -ForegroundColor Green
Write-Host "🌐 Agent is available at: $DASHPOINT_AI_AGENT_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "Available endpoints:" -ForegroundColor White
Write-Host "  - GET  $DASHPOINT_AI_AGENT_URL/ (Root)" -ForegroundColor Gray
Write-Host "  - POST $DASHPOINT_AI_AGENT_URL/chat (Chat with AI)" -ForegroundColor Gray
Write-Host "  - POST $DASHPOINT_AI_AGENT_URL/summarize-text (Text Summarization)" -ForegroundColor Gray
Write-Host "  - POST $DASHPOINT_AI_AGENT_URL/summarize-youtube (YouTube Summarization)" -ForegroundColor Gray
Write-Host "  - GET  $DASHPOINT_AI_AGENT_URL/health (Health Check)" -ForegroundColor Gray
