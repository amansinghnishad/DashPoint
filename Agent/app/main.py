"""
DashPoint AI Agent - Intelligent content processing and summarization service
Provides AI-powered text summarization, YouTube video analysis, and web content extraction
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set up paths for imports
current_dir = Path(__file__).parent
sys.path.append(str(current_dir))
sys.path.append(str(current_dir / "utils" / "models"))
sys.path.append(str(current_dir / "utils" / "agents"))

# Load environment variables from .env file
load_dotenv(dotenv_path=current_dir / '.env')

# Import the core functions
from utils.models.textsum_client import summarize_text_content
from utils.models.youtube_client import summarize_youtube_video

# Import Gemini client for intelligent task routing
try:
    from utils.agents.gemini_client import get_client_and_config, register_functions, process_agent_response
    from utils.agents.web_extractor import extract_web_content
    GEMINI_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Gemini client not available: {e}")
    GEMINI_AVAILABLE = False

# Create the FastAPI app
app = FastAPI(
    title="DashPoint AI Agent",
    description="Intelligent content processing, summarization, and extraction service",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure based on your needs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request models
class ChatRequest(BaseModel):
    prompt: str
    context: Optional[str] = None

class TextSummaryRequest(BaseModel):
    text_content: str
    summary_length: str = "medium"

class YouTubeSummaryRequest(BaseModel):
    youtube_url: str
    summary_length: str = "medium"

class ContentExtractionRequest(BaseModel):
    url: str
    generate_summary: bool = False
    summary_length: str = "medium"
    extract_images: bool = False
    extract_links: bool = False

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "service": "DashPoint AI Agent",
        "version": "2.0.0",
        "description": "Intelligent content processing and summarization service",
        "endpoints": {
            "chat": "/chat - Intelligent chat interface with function calling",
            "text_summary": "/summarize-text - Direct text summarization",
            "youtube_summary": "/summarize-youtube - YouTube video summarization",
            "content_extraction": "/extract-content - Web content extraction and analysis",
            "health": "/health - Service health check"
        },
        "gemini_available": GEMINI_AVAILABLE
    }

@app.post("/chat")
async def chat_with_ai(request: ChatRequest):
    """
    Intelligent chat endpoint that uses AI to understand user intent and call appropriate functions
    """
    if not GEMINI_AVAILABLE:
        # Fallback to basic parsing if Gemini is not available
        return await fallback_chat_processing(request)
    
    try:
        # Get the Gemini model and available functions
        model, _ = get_client_and_config()
        available_functions = register_functions()
        
        # Prepare the full prompt with context
        full_prompt = request.prompt
        if request.context:
            full_prompt = f"Context: {request.context}\n\nUser Request: {request.prompt}"
        
        logger.info(f"Processing chat request: {full_prompt[:100]}...")
        
        # Generate response using Gemini with function calling
        response = model.generate_content(full_prompt)
        logger.info(f"Gemini response received: {response}")
        
        # Process the response and execute function calls
        results = process_agent_response(response, available_functions)
        logger.info(f"Processed results: {results}")
        
        # If no function calls were made but we have content, try fallback
        if not results and hasattr(response, 'text') and response.text:
            logger.info("No function calls detected, falling back to basic processing")
            return await fallback_chat_processing(request)
        
        return {
            "success": True,
            "results": results,
            "agent_used": "Gemini Pro",
            "prompt": request.prompt
        }
        
    except Exception as e:
        logger.error(f"Chat processing failed: {str(e)}")
        # Fallback to basic processing
        return await fallback_chat_processing(request)

async def fallback_chat_processing(request: ChatRequest):
    """Fallback chat processing when Gemini is not available"""
    try:
        prompt_lower = request.prompt.lower()
        
        # Simple intent detection
        if any(keyword in prompt_lower for keyword in ['youtube', 'video', 'youtu.be']):
            # Try to extract YouTube URL
            import re
            url_pattern = r'(https?://)?(www\.)?(youtube\.com/watch\?v=|youtu\.be/)[\w-]+'
            match = re.search(url_pattern, request.prompt)
            
            if match:
                youtube_url = match.group(0)
                if not youtube_url.startswith('http'):
                    youtube_url = 'https://' + youtube_url
                
                summary = summarize_youtube_video(youtube_url, "medium")
                return {
                    "success": True,
                    "results": [{
                        "type": "function_result",
                        "function": "summarize_youtube_video",
                        "args": {"youtube_url": youtube_url, "summary_length": "medium"},
                        "result": {"success": True, "data": summary}
                    }],
                    "agent_used": "Fallback Parser"
                }
        
        elif any(keyword in prompt_lower for keyword in ['extract', 'content', 'url', 'website', 'web']):
            # Try to extract URL
            import re
            url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
            match = re.search(url_pattern, request.prompt)
            
            if match:
                url = match.group(0)
                content_data = extract_web_content(url, generate_summary=True)
                return {
                    "success": True,
                    "results": [{
                        "type": "function_result",
                        "function": "extract_web_content",
                        "args": {"url": url, "generate_summary": True},
                        "result": {"success": True, "data": content_data}
                    }],
                    "agent_used": "Fallback Parser"
                }
        
        # Default to text summarization
        summary = summarize_text_content(request.prompt, "medium")
        return {
            "success": True,
            "results": [{
                "type": "function_result",
                "function": "summarize_text_content",
                "args": {"text_content": request.prompt, "summary_length": "medium"},
                "result": {"success": True, "data": summary}
            }],
            "agent_used": "Fallback Parser"
        }
        
    except Exception as e:
        logger.error(f"Fallback processing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@app.post("/summarize-text")
async def summarize_text(request: TextSummaryRequest):
    """Direct endpoint for text summarization"""
    try:
        if not request.text_content.strip():
            raise HTTPException(status_code=400, detail="Text content cannot be empty")
        
        summary = summarize_text_content(request.text_content, request.summary_length)
        
        return {
            "success": True,
            "data": {
                "summary": summary,
                "input_length": len(request.text_content.split()),
                "summary_length": request.summary_length,
                "processing_method": "Direct Text Summarization"
            }
        }
    except Exception as e:
        logger.error(f"Text summarization failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error summarizing text: {str(e)}")

@app.post("/summarize-youtube")
async def summarize_youtube(request: YouTubeSummaryRequest):
    """Direct endpoint for YouTube video summarization"""
    try:
        if not request.youtube_url.strip():
            raise HTTPException(status_code=400, detail="YouTube URL cannot be empty")
        
        summary = summarize_youtube_video(request.youtube_url, request.summary_length)
        
        return {
            "success": True,
            "data": {
                "summary": summary,
                "video_url": request.youtube_url,
                "summary_length": request.summary_length,
                "processing_method": "YouTube Video Analysis"
            }
        }
    except Exception as e:
        logger.error(f"YouTube summarization failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error summarizing YouTube video: {str(e)}")

@app.post("/extract-content")
async def extract_content(request: ContentExtractionRequest):
    """Direct endpoint for web content extraction"""
    try:
        if not request.url.strip():
            raise HTTPException(status_code=400, detail="URL cannot be empty")
        
        content_data = extract_web_content(
            url=request.url,
            generate_summary=request.generate_summary,
            summary_length=request.summary_length
        )
        
        return {
            "success": True,
            "data": content_data
        }
    except Exception as e:
        logger.error(f"Content extraction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error extracting content: {str(e)}")

@app.get("/health")
async def health_check():
    """Comprehensive health check endpoint"""
    return {
        "status": "healthy",
        "service": "DashPoint AI Agent",
        "version": "2.0.0",
        "gemini_available": GEMINI_AVAILABLE,
        "capabilities": [
            "text_summarization",
            "youtube_analysis",
            "content_extraction",
            "intelligent_chat" if GEMINI_AVAILABLE else "basic_chat"
        ]
    }

# Run the server when executed directly
if __name__ == "__main__":
    import uvicorn
    logger.info("Starting DashPoint AI Agent...")
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        log_level="info"
    )
