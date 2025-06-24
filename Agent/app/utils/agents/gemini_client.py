"""
Gemini AI client for function calling and intelligent task routing
"""
import os
import json
from typing import Dict, List, Any, Optional
import google.generativeai as genai
from google.generativeai.types import GenerationConfig, FunctionDeclaration, Tool

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def get_client_and_config():
    """Get configured Gemini client and generation config"""
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY environment variable not set")
    
    # Define available functions
    summarize_text_function = FunctionDeclaration(
        name="summarize_text_content",
        description="Summarize text content with specified length",
        parameters={
            "type": "object",
            "properties": {
                "text_content": {
                    "type": "string",
                    "description": "The text content to summarize"
                },
                "summary_length": {
                    "type": "string",
                    "description": "Length of summary: 'short', 'medium', 'long'",
                    "enum": ["short", "medium", "long"]
                }
            },
            "required": ["text_content"]        }
    )
    
    summarize_youtube_function = FunctionDeclaration(
        name="summarize_youtube_video",
        description="Summarize a YouTube video using metadata analysis from YouTube Data API v3 (title, description, tags, statistics)",
        parameters={
            "type": "object",
            "properties": {
                "youtube_url": {
                    "type": "string",
                    "description": "The YouTube video URL to summarize"
                },
                "summary_length": {
                    "type": "string",
                    "description": "Length of summary: 'short', 'medium', 'long'",
                    "enum": ["short", "medium", "long"]
                }
            },
            "required": ["youtube_url"]
        }
    )
    
    extract_content_function = FunctionDeclaration(
        name="extract_web_content",
        description="Extract and analyze content from web URLs with optional summarization",
        parameters={
            "type": "object",
            "properties": {
                "url": {
                    "type": "string",
                    "description": "The web URL to extract content from"
                },
                "generate_summary": {
                    "type": "boolean",
                    "description": "Whether to generate AI summary of the content"
                },
                "summary_length": {
                    "type": "string",
                    "description": "Length of summary: 'short', 'medium', 'long'",
                    "enum": ["short", "medium", "long"]
                }
            },
            "required": ["url"]
        }
    )
    
    # Create tool with functions
    tools = [Tool(function_declarations=[
        summarize_text_function,
        summarize_youtube_function,
        extract_content_function
    ])]
    
    # Generation configuration
    config = GenerationConfig(
        temperature=0.7,
        top_p=0.8,
        top_k=40,
        max_output_tokens=2048,
    )
    
    # Get the model
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        tools=tools,
        generation_config=config
    )
    
    return model, config

def register_functions() -> Dict[str, Any]:
    """Register available functions that can be called by Gemini"""
    from ..models.textsum_client import summarize_text_content
    from ..models.youtube_client import summarize_youtube_video
    from .web_extractor import extract_web_content
    
    return {
        "summarize_text_content": summarize_text_content,
        "summarize_youtube_video": summarize_youtube_video,
        "extract_web_content": extract_web_content
    }

def process_agent_response(response, available_functions: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Process Gemini response and execute function calls"""
    import logging
    logger = logging.getLogger(__name__)
    
    result_parts = []
    
    logger.info(f"Processing response with {len(response.candidates)} candidates")
    
    for candidate in response.candidates:
        logger.info(f"Processing candidate with {len(candidate.content.parts)} parts")
        
        for part in candidate.content.parts:
            logger.info(f"Processing part: {type(part)}")
            
            if hasattr(part, 'function_call') and part.function_call:
                function_name = part.function_call.name
                function_args = dict(part.function_call.args)
                
                logger.info(f"Function call detected: {function_name} with args: {function_args}")
                
                if function_name in available_functions:
                    try:
                        function_result = available_functions[function_name](**function_args)
                        result_parts.append({
                            "type": "function_result",
                            "function": function_name,
                            "args": function_args,
                            "result": {
                                "success": True,
                                "data": function_result
                            }
                        })
                    except Exception as e:
                        logger.error(f"Function execution failed: {e}")
                        result_parts.append({
                            "type": "function_error",
                            "function": function_name,
                            "args": function_args,
                            "error": str(e)
                        })
                else:
                    logger.warning(f"Unknown function: {function_name}")
                    result_parts.append({
                        "type": "unknown_function",
                        "function": function_name,
                        "args": function_args
                    })
            elif hasattr(part, 'text') and part.text:
                logger.info(f"Text content: {part.text[:100]}...")
                result_parts.append({
                    "type": "text",
                    "content": part.text
                })
    
    logger.info(f"Final result_parts: {len(result_parts)} parts")
    return result_parts