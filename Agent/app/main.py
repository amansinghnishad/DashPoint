"""
FastAPI server for intelligent content processing using AI agents.
This server provides endpoints for content summarization, extraction, and analysis.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any

# Set up paths for imports
current_dir = Path(__file__).parent
sys.path.append(str(current_dir))
sys.path.append(str(current_dir / "utils" / "models"))
sys.path.append(str(current_dir / "utils" / "agents"))

# Load environment variables from .env file
load_dotenv(dotenv_path=current_dir / '.env')

# Import the new agent
try:
    from utils.agents.gemini_client import get_content_processing_agent
    agent_available = True
except ImportError as e:
    print(f"Warning: Failed to import content processing agent: {e}")
    agent_available = False
    get_content_processing_agent = None

# Import the conversational agent
try:
    from utils.agents.conversational_agent import get_conversational_agent
    conversational_agent_available = True
except ImportError as e:
    print(f"Warning: Failed to import conversational agent: {e}")
    conversational_agent_available = False
    get_conversational_agent = None

# Create the FastAPI app
app = FastAPI(
    title="DashPoint AI Agent API", 
    description="Intelligent content processing API using AI agents",
    version="2.0.0"
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


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "DashPoint AI Agent API",
        "version": "2.0.0",
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
    if not agent_available:
        raise HTTPException(status_code=503, detail="AI agent not available")
    
    try:
        agent = get_content_processing_agent()
        
        # Process the user request
        user_prompt = request.prompt
        if request.context:
            user_prompt = f"Context: {request.context}\n\nUser Request: {request.prompt}"
        
        result = agent.process_user_request(user_prompt)
        
        if result["success"]:
            return {
                "success": True,
                "results": result["results"],
                "agent_version": "2.0.0"
            }
        else:
            raise HTTPException(status_code=500, detail=f"Agent processing failed: {result['error']}")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")


@app.post("/analyze-content")
async def analyze_content(request: ContentAnalysisRequest):
    """
    Analyze content using AI agent
    """
    if not agent_available:
        raise HTTPException(status_code=503, detail="AI agent not available")
    
    try:
        agent = get_content_processing_agent()
        
        # Use the extract_content_info function
        function_args = {
            "content": request.content,
            "extract_type": request.analysis_type
        }
        
        result = agent.available_functions["extract_content_info"](**function_args)
        
        return {
            "success": result.get("success", True),
            "analysis_type": request.analysis_type,
            "result": result
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing content: {str(e)}")


@app.post("/summarize-text")
async def summarize_text(request: TextSummaryRequest):
    """
    Direct text summarization endpoint using AI agent
    """
    if not agent_available:
        raise HTTPException(status_code=503, detail="AI agent not available")
    
    try:
        agent = get_content_processing_agent()
        
        result = agent.available_functions["summarize_text_content"](
            text_content=request.text_content,
            summary_length=request.summary_length
        )
        
        if result["success"]:
            return {
                "success": True,
                "summary": result["summary"],
                "content_type": result["content_type"],
                "original_length": result.get("original_length", 0),
                "summary_length": request.summary_length,
                "agent_version": "2.0.0"
            }
        else:
            raise HTTPException(status_code=500, detail=f"Summarization failed: {result['error']}")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error summarizing text: {str(e)}")


@app.post("/summarize-youtube")
async def summarize_youtube(request: YouTubeSummaryRequest):
    """
    Direct YouTube video summarization endpoint using AI agent
    """
    if not agent_available:
        raise HTTPException(status_code=503, detail="AI agent not available")
    
    try:
        agent = get_content_processing_agent()
        
        result = agent.available_functions["summarize_youtube_video"](
            youtube_url=request.youtube_url,
            summary_length=request.summary_length
        )
        
        if result["success"]:
            return {
                "success": True,
                "summary": result["summary"],
                "content_type": result["content_type"],
                "video_url": result["video_url"],
                "summary_length": request.summary_length,
                "agent_version": "2.0.0"
            }
        else:
            raise HTTPException(status_code=500, detail=f"YouTube summarization failed: {result['error']}")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error summarizing YouTube video: {str(e)}")


@app.post("/extract-content")
async def extract_content(request: ContentExtractionRequest):
    """
    Extract and analyze web content using AI agent
    """
    if not agent_available:
        raise HTTPException(status_code=503, detail="AI agent not available")
    
    try:
        agent = get_content_processing_agent()
        
        # First analyze content type
        content_type_result = agent.available_functions["analyze_content_type"](
            input_text=request.url
        )
        
        if not content_type_result["success"]:
            raise HTTPException(status_code=400, detail="Failed to analyze content type")
        
        # Process based on content type
        if content_type_result["content_type"] == "youtube":
            result = agent.available_functions["summarize_youtube_video"](
                youtube_url=request.url,
                summary_length="medium"
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
            "agent_version": "2.0.0"
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting content: {str(e)}")


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
    if not conversational_agent_available:
        raise HTTPException(status_code=503, detail="Conversational agent not available")
    
    try:
        agent = get_conversational_agent()
        
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
            "agent_version": "2.0.0-conversational"
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing conversational command: {str(e)}")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "service": "DashPoint AI Agent API",
        "version": "2.0.0",
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
        agent = get_content_processing_agent()
        return {
            "agent_available": True,
            "version": "2.0.0",
            "available_functions": list(agent.available_functions.keys()),
            "function_definitions": agent.function_definitions
        }
    except Exception as e:
        return {
            "agent_available": False,
            "error": str(e)
        }


@app.get("/capabilities")
async def get_capabilities():
    """Get conversational agent capabilities and supported commands"""
    try:
        if conversational_agent_available:
            agent = get_conversational_agent()
            
            return {
                "success": True,
                "agent_available": True,
                "capabilities": {
                    "supported_actions": list(agent.action_functions.keys()),
                    "command_patterns": {
                        action: patterns for action, patterns in agent.command_patterns.items()
                    },
                    "examples": {
                        "notes": [
                            'add note "Meeting at 3pm tomorrow"',
                            'create note "Remember to buy groceries"',
                            'note: Call mom later'
                        ],
                        "todos": [
                            'add todo "Review project documentation"',
                            'add task "Finish quarterly report"',
                            'i need to submit the proposal'
                        ],
                        "youtube": [
                            'summarize https://www.youtube.com/watch?v=example',
                            'save youtube https://youtu.be/example'
                        ],
                        "content": [
                            'extract content from https://example.com',
                            'summarize this page https://news.example.com'
                        ],
                        "weather": [
                            'weather for New York',
                            'what\'s the weather in London'
                        ],
                        "ai": [
                            'explain machine learning',
                            'how to create a React component'
                        ]
                    }
                },
                "features": [
                    "Natural language processing",
                    "Pattern matching for quick responses", 
                    "AI fallback for complex commands",
                    "Automatic API call generation",
                    "Context-aware processing"
                ]
            }
        else:
            return {
                "success": False,
                "agent_available": False,
                "message": "Conversational agent not available",
                "basic_patterns": {
                    "notes": ['add note "content"', 'note: content'],
                    "todos": ['add todo "content"', 'todo: content']
                }
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Error retrieving capabilities"
        }


# Run the server when executed directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
