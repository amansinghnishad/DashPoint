"""
FastAPI server for text and YouTube video summarization.
This server provides endpoints for summarizing text and YouTube videos.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# Set up paths for imports
current_dir = Path(__file__).parent
sys.path.append(str(current_dir))
sys.path.append(str(current_dir / "utils" / "models"))
sys.path.append(str(current_dir / "utils" / "agents"))

# Load environment variables from .env file
load_dotenv(dotenv_path=current_dir / '.env')

# Import the summarization functions directly
from utils.models.textsum_client import summarize_text_content
from utils.models.youtube_client import summarize_youtube_video

# Import Gemini client for function calling
try:
    from utils.agents.gemini_client import get_client_and_config, register_functions
except ImportError as e:
    print(f"Warning: Failed to import Gemini client: {e}")
    get_client_and_config = None
    register_functions = None

# Create the FastAPI app
app = FastAPI(title="AI Summarization API", description="API for text and YouTube video summarization")

# Define request models
class UserPrompt(BaseModel):
    prompt: str

class TextSummaryRequest(BaseModel):
    text_content: str
    summary_length: str = "medium"

class YouTubeSummaryRequest(BaseModel):
    youtube_url: str
    summary_length: str = "medium"

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "AI Summarization API",
        "endpoints": [
            "/chat",
            "/summarize-text", 
            "/summarize-youtube"
        ]
    }

@app.post("/chat")
async def chat_with_ai(request: UserPrompt):
    """
    Chat endpoint that uses Gemini to parse user prompts and call the appropriate function
    """
    if get_client_and_config is None:
        raise HTTPException(status_code=500, detail="Gemini client not available")
    
    try:
        # Get the Gemini client and config
        client, config = get_client_and_config()
        
        # Register functions that can be called by Gemini
        available_functions = register_functions()
        
        # Generate a response using Gemini
        response = client.models.generate_content(
            model="gemini-1.5-pro",
            contents=request.prompt,
            config=config
        )
        
        # Process the response to find function calls
        result_parts = []
        function_called = False
        
        for part in response.candidates[0].content.parts:
            if hasattr(part, 'function_call') and part.function_call:
                function_called = True
                function_name = part.function_call.name
                function_args = dict(part.function_call.args)
                
                if function_name in available_functions:
                    try:
                        function_result = available_functions[function_name](**function_args)
                        result_parts.append({
                            "type": "function_result",
                            "function": function_name,
                            "args": function_args,
                            "result": function_result
                        })
                    except Exception as e:
                        result_parts.append({
                            "type": "function_error",
                            "function": function_name,
                            "error": str(e)
                        })
                else:
                    result_parts.append({
                        "type": "unknown_function",
                        "function": function_name
                    })
            elif hasattr(part, 'text') and part.text:
                result_parts.append({
                    "type": "text", 
                    "content": part.text
                })
        
        if not function_called:
            # If no function was called, let's try to determine which function would be appropriate
            text = response.candidates[0].content.text if hasattr(response.candidates[0].content, 'text') else ""
            if "youtube" in request.prompt.lower() or "video" in request.prompt.lower() or "youtu.be" in request.prompt.lower():
                # Extract a potential YouTube URL
                import re
                url_pattern = r'(https?://)?(www\.)?(youtube\.com/watch\?v=|youtu\.be/)[\w-]+'
                match = re.search(url_pattern, request.prompt)
                if match:
                    youtube_url = match.group(0)
                    try:
                        summary = summarize_youtube_video(youtube_url, "medium")
                        result_parts.append({
                            "type": "function_result",
                            "function": "summarize_youtube_video",
                            "args": {"youtube_url": youtube_url, "summary_length": "medium"},
                            "result": summary
                        })
                    except Exception as e:
                        result_parts.append({
                            "type": "function_error",
                            "function": "summarize_youtube_video",
                            "error": str(e)
                        })
            else:
                # Default to text summarization
                try:
                    # Extract text to summarize - just use the prompt itself
                    text_to_summarize = request.prompt
                    summary = summarize_text_content(text_to_summarize, "medium")
                    result_parts.append({
                        "type": "function_result",
                        "function": "summarize_text_content",
                        "args": {"text_content": text_to_summarize, "summary_length": "medium"},
                        "result": summary
                    })
                except Exception as e:
                    result_parts.append({
                        "type": "function_error",
                        "function": "summarize_text_content",
                        "error": str(e)
                    })
        
        return {"response": result_parts}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")

@app.post("/summarize-text")
async def summarize_text(request: TextSummaryRequest):
    """Endpoint for summarizing text content"""
    try:
        summary = summarize_text_content(request.text_content, request.summary_length)
        return {
            "summary": summary,
            "input_length": len(request.text_content.split()),
            "summary_length": request.summary_length
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error summarizing text: {str(e)}")

@app.post("/summarize-youtube")
async def summarize_youtube(request: YouTubeSummaryRequest):
    """Endpoint for summarizing YouTube videos"""
    try:
        summary = summarize_youtube_video(request.youtube_url, request.summary_length)
        return {
            "summary": summary,
            "video_url": request.youtube_url,
            "summary_length": request.summary_length
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error summarizing YouTube video: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "AI Summarization API"}

# Run the server when executed directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
