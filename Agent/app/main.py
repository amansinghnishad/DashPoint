"""FastAPI server exposing DashPoint AI agent capabilities."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


API_VERSION = "2.0.0"


# Ensure the utils package is importable when running directly
current_dir = Path(__file__).parent
sys.path.extend(
    [
        str(current_dir),
        str(current_dir / "utils" / "models"),
        str(current_dir / "utils" / "agents"),
    ]
)


# Load environment variables from .env file if present
load_dotenv(dotenv_path=current_dir / ".env")


# Attempt to import agents; keep flags for graceful degradation
try:
    from utils.agents.gemini_client import get_content_processing_agent

    agent_available = True
except ImportError as exc:  # pragma: no cover - defensive path
    print(f"Warning: Failed to import content processing agent: {exc}")
    agent_available = False
    get_content_processing_agent = None

try:
    from utils.agents.conversational_agent import get_conversational_agent

    conversational_agent_available = True
except ImportError as exc:  # pragma: no cover - defensive path
    print(f"Warning: Failed to import conversational agent: {exc}")
    conversational_agent_available = False
    get_conversational_agent = None


app = FastAPI(
    title="DashPoint AI Agent API",
    description="Intelligent content processing API using AI agents",
    version=API_VERSION,
)

# Define request models
class ChatRequest(BaseModel):
    prompt: str
    context: Optional[str] = None

class ContentAnalysisRequest(BaseModel):
    content: str
    analysis_type: Optional[str] = "summary"  # summary, keywords, topics, sentiment
    
class TextSummaryRequest(BaseModel):
    text_content: str
    summary_length: str = "medium"

class YouTubeSummaryRequest(BaseModel):
    youtube_url: str
    summary_length: str = "medium"

class ContentExtractionRequest(BaseModel):
    url: str
    extract_type: str = "summary"  # summary, full_content, metadata

class ConversationalRequest(BaseModel):
    command: str
    context: Optional[Dict[str, Any]] = None


def _require_content_agent():
    if not agent_available or get_content_processing_agent is None:
        raise HTTPException(status_code=503, detail="AI agent not available")
    try:
        return get_content_processing_agent()
    except Exception as exc:  # pragma: no cover - runtime guard
        raise HTTPException(status_code=500, detail=f"Failed to initialise AI agent: {exc}") from exc


def _require_conversational_agent():
    if not conversational_agent_available or get_conversational_agent is None:
        raise HTTPException(status_code=503, detail="Conversational agent not available")
    try:
        return get_conversational_agent()
    except Exception as exc:  # pragma: no cover - runtime guard
        raise HTTPException(status_code=500, detail=f"Failed to initialise conversational agent: {exc}") from exc


def _call_agent_function(agent, function_name: str, **kwargs):
    function = agent.available_functions.get(function_name)
    if not function:
        raise HTTPException(status_code=500, detail=f"Agent function '{function_name}' not registered")
    return function(**kwargs)


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "DashPoint AI Agent API",
        "version": API_VERSION,
        "agent_available": agent_available,
        "endpoints": {
            "chat": "/chat - Intelligent chat with function calling",
            "analyze": "/analyze-content - Content analysis and processing", 
            "summarize_text": "/summarize-text - Direct text summarization",
            "summarize_youtube": "/summarize-youtube - Direct YouTube summarization",
            "extract_content": "/extract-content - Web content extraction and analysis"
        }
    }


@app.post("/chat")
async def chat_with_agent(request: ChatRequest):
    """
    Intelligent chat endpoint using AI agent with function calling capabilities
    """
    try:
        agent = _require_content_agent()
        
        # Process the user request
        user_prompt = request.prompt
        if request.context:
            user_prompt = f"Context: {request.context}\n\nUser Request: {request.prompt}"
        
        result = agent.process_user_request(user_prompt)
        
        if result.get("success"):
            return {
                "success": True,
                "results": result["results"],
                "agent_version": API_VERSION,
            }
        raise HTTPException(
            status_code=500,
            detail=f"Agent processing failed: {result.get('error', 'Unknown error')}",
        )
            
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - runtime guard
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {exc}") from exc


@app.post("/analyze-content")
async def analyze_content(request: ContentAnalysisRequest):
    """
    Analyze content using AI agent
    """
    try:
        agent = _require_content_agent()
        result = _call_agent_function(
            agent,
            "extract_content_info",
            content=request.content,
            extract_type=request.analysis_type,
        )
        
        return {
            "success": result.get("success", True),
            "analysis_type": request.analysis_type,
            "result": result
        }
            
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - runtime guard
        raise HTTPException(status_code=500, detail=f"Error analyzing content: {exc}") from exc


@app.post("/summarize-text")
async def summarize_text(request: TextSummaryRequest):
    """
    Direct text summarization endpoint using AI agent
    """
    try:
        agent = _require_content_agent()
        result = _call_agent_function(
            agent,
            "summarize_text_content",
            text_content=request.text_content,
            summary_length=request.summary_length,
        )
        
        if result.get("success"):
            return {
                "success": True,
                "summary": result["summary"],
                "content_type": result["content_type"],
                "original_length": result.get("original_length", 0),
                "summary_length": request.summary_length,
                "agent_version": API_VERSION,
            }
        raise HTTPException(
            status_code=500,
            detail=f"Summarization failed: {result.get('error', 'Unknown error')}",
        )
            
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - runtime guard
        raise HTTPException(status_code=500, detail=f"Error summarizing text: {exc}") from exc


@app.post("/summarize-youtube")
async def summarize_youtube(request: YouTubeSummaryRequest):
    """
    Direct YouTube video summarization endpoint using AI agent
    """
    try:
        agent = _require_content_agent()
        result = _call_agent_function(
            agent,
            "summarize_youtube_video",
            youtube_url=request.youtube_url,
            summary_length=request.summary_length,
        )
        
        if result.get("success"):
            return {
                "success": True,
                "summary": result["summary"],
                "content_type": result["content_type"],
                "video_url": result["video_url"],
                "summary_length": request.summary_length,
                "agent_version": API_VERSION,
            }
        raise HTTPException(
            status_code=500,
            detail=f"YouTube summarization failed: {result.get('error', 'Unknown error')}",
        )
            
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - runtime guard
        raise HTTPException(status_code=500, detail=f"Error summarizing YouTube video: {exc}") from exc


@app.post("/extract-content")
async def extract_content(request: ContentExtractionRequest):
    """
    Extract and analyze web content using AI agent
    """
    try:
        agent = _require_content_agent()
        content_type_result = _call_agent_function(
            agent,
            "analyze_content_type",
            input_text=request.url,
        )
        
        if not content_type_result["success"]:
            raise HTTPException(status_code=400, detail="Failed to analyze content type")
        
        # Process based on content type
        if content_type_result["content_type"] == "youtube":
            result = _call_agent_function(
                agent,
                "summarize_youtube_video",
                youtube_url=request.url,
                summary_length="medium",
            )
        elif content_type_result["content_type"] == "url":
            # For web URLs, we'd need to implement web scraping
            # For now, return the content type analysis
            result = {
                "success": True,
                "message": "Web content extraction not yet implemented",
                "content_type": "url",
                "suggested_action": "Use external web scraping service"
            }
        else:
            # Treat as text content
            result = agent.available_functions["summarize_text_content"](
                text_content=request.url,
                summary_length="medium"
            )
        
        return {
            "success": True,
            "content_analysis": content_type_result,
            "extraction_result": result,
            "agent_version": API_VERSION,
        }
            
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - runtime guard
        raise HTTPException(status_code=500, detail=f"Error extracting content: {exc}") from exc


@app.post("/conversational")
async def conversational_command(request: ConversationalRequest):
    """
    Conversational command interface - understands natural language and executes actions
    
    Examples:
    - "add note 'Buy groceries'"
    - "summarize this video https://youtube.com/watch?v=..."
    - "create todo 'Finish project'"
    - "what's the weather in New York?"
    """
    try:
        agent = _require_conversational_agent()
        
        result = agent.process_command(
            user_input=request.command,
            user_context=request.context or {}
        )
        
        return {
            "success": result.get("success", True),
            "message": result.get("message", "Command processed"),
            "action": result.get("action", "unknown"),
            "confidence": result.get("confidence", 0.0),
            "method": result.get("method", "unknown"),
            "api_call": result.get("api_call"),
            "result": result.get("result"),
            "agent_version": f"{API_VERSION}-conversational",
        }
            
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - runtime guard
        raise HTTPException(status_code=500, detail=f"Error processing conversational command: {exc}") from exc


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "service": "DashPoint AI Agent API",
        "version": API_VERSION,
        "agent_available": agent_available
    }


@app.get("/agent-info")
async def agent_info():
    """Get information about the available agent functions"""
    if not agent_available:
        return {
            "agent_available": False,
            "message": "AI agent not available"
        }
    
    try:
        agent = _require_content_agent()
        return {
            "agent_available": True,
            "version": API_VERSION,
            "available_functions": list(agent.available_functions.keys()),
            "function_definitions": [spec.as_dict() for spec in agent.FUNCTION_DEFINITIONS],
        }
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - runtime guard
        return {
            "agent_available": False,
            "error": str(exc),
        }


@app.get("/capabilities")
async def get_capabilities():
    """Get conversational agent capabilities and supported commands"""
    try:
        agent = _require_conversational_agent()

        commands = getattr(agent, "_commands", [])
        command_patterns: Dict[str, List[str]] = {}
        for command in commands:
            command_patterns[command.name] = [pattern.pattern for pattern in command.patterns]

        return {
            "success": True,
            "agent_available": True,
            "capabilities": {
                "supported_actions": sorted(command_patterns.keys()),
                "command_patterns": command_patterns,
                "examples": {
                    "notes": [
                        'add note "Meeting at 3pm tomorrow"',
                        'create note "Remember to buy groceries"',
                        'note: Call mom later',
                    ],
                    "todos": [
                        'add todo "Review project documentation"',
                        'add task "Finish quarterly report"',
                        'i need to submit the proposal',
                    ],
                    "youtube": [
                        'summarize https://www.youtube.com/watch?v=example',
                        'save youtube https://youtu.be/example',
                    ],
                    "content": [
                        'extract content from https://example.com',
                        'summarize this page https://news.example.com',
                    ],
                    "weather": [
                        'weather for New York',
                        "what's the weather in London",
                    ],
                    "ai": [
                        'explain machine learning',
                        'how to create a React component',
                    ],
                },
            },
            "features": [
                "Natural language processing",
                "Pattern matching for quick responses",
                "AI fallback for complex commands",
                "Automatic API call generation",
                "Context-aware processing",
            ],
        }
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - runtime guard
        return {
            "success": False,
            "error": str(exc),
            "message": "Error retrieving capabilities"
        }


# Run the server when executed directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
