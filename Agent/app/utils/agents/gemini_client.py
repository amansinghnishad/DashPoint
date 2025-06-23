"""
Google Gemini client for function calling i    # Configure the Gemini client
    genai.configure(api_key=api_key)
    
    # Create the generative model
    model = genai.GenerativeModel('gemini-flash-2.0')
    
    # Define function schemas for Gemini function callingion.
This module provides functions to set up Gemini client and register available functions.
"""

import os
import sys
from pathlib import Path
from typing import Dict, Any, Callable

try:
    import google.generativeai as genai
except ImportError:
    print("Warning: google-generativeai package not installed. Install with: pip install google-generativeai")
    genai = None

# Add parent directories to path for imports
current_dir = Path(__file__).parent
sys.path.append(str(current_dir.parent / "models"))

# Import the summarization functions
try:
    from textsum_client import summarize_text_content
    from youtube_client import summarize_youtube_video
except ImportError:
    # Fallback imports with full path
    sys.path.append(str(current_dir.parent.parent))
    from utils.models.textsum_client import summarize_text_content
    from utils.models.youtube_client import summarize_youtube_video


def get_client_and_config():
    """
    Initialize and return the Gemini client, configuration, and tools.
    
    Returns:
        tuple: (client, config, tools) where client is the configured Gemini client,
               config is the generation configuration, and tools are the function calling tools
    """
    if genai is None:
        raise ImportError("google-generativeai package not installed. Install with: pip install google-generativeai")
    
    # Get API key from environment
    api_key = os.getenv("GOOGLE_GEMINI_KEY")
    if not api_key:
        raise ValueError("GOOGLE_GEMINI_KEY environment variable not set")
    
    # Configure the Gemini client
    genai.configure(api_key=api_key)
    
    # Create the generative model
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    # Define function schemas for Gemini function calling
    function_schemas = [
        {
            "name": "summarize_text_content",
            "description": "Summarizes provided text content with specified length. Use this when the user wants to summarize text, articles, or written content.",
            "parameters": {
                "type": "object",
                "properties": {
                    "text_content": {
                        "type": "string",
                        "description": "The text content to summarize"
                    },
                    "summary_length": {
                        "type": "string", 
                        "description": "Length of summary - 'short', 'medium', 'long', or numeric value"
                    }
                },
                "required": ["text_content"]
            }
        },
        {
            "name": "summarize_youtube_video",
            "description": "Summarizes a YouTube video by extracting and analyzing its content. Use this when the user provides a YouTube URL or asks to summarize a video.",
            "parameters": {
                "type": "object",
                "properties": {
                    "youtube_url": {
                        "type": "string",
                        "description": "The YouTube video URL to summarize (youtube.com or youtu.be format)"
                    },
                    "summary_length": {
                        "type": "string",
                        "description": "Length of summary - 'short', 'medium', 'long', or numeric value"
                    }
                },
                "required": ["youtube_url"]
            }
        }
    ]
    
    # Create generation config with function calling
    generation_config = genai.types.GenerationConfig(
        temperature=0.7,
        top_p=0.9,
        top_k=40,
        max_output_tokens=2048
    )
    
    # Create tools for function calling
    tools = [{"function_declarations": function_schemas}]
    
    return model, generation_config, tools


def register_functions() -> Dict[str, Callable]:
    """
    Register and return available functions that can be called by Gemini.
    
    Returns:
        dict: Dictionary mapping function names to callable functions
    """
    return {
        "summarize_text_content": summarize_text_content,
        "summarize_youtube_video": summarize_youtube_video
    }


def process_function_calls(response, available_functions: Dict[str, Callable]) -> list:
    """
    Process function calls from Gemini response and execute them.
    
    Args:
        response: The response from Gemini containing function calls
        available_functions: Dictionary of available functions
        
    Returns:
        list: List of results from function calls and text responses
    """
    result_parts = []
    
    for candidate in response.candidates:
        for part in candidate.content.parts:
            if hasattr(part, 'function_call') and part.function_call:
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
    
    return result_parts


def chat_with_functions(prompt: str) -> dict:
    """
    High-level function to chat with Gemini using function calling.
    
    Args:
        prompt: User's prompt/question
        
    Returns:
        dict: Response containing function results and/or text
    """
    try:
        # Get client and config
        model, config, tools = get_client_and_config()
        
        # Register available functions
        available_functions = register_functions()
        
        results = []
        gemini_api_successful = True
        
        # Try to use Gemini API for function calling
        try:
            # Generate a response using Gemini with function calling enabled
            response = model.generate_content(
                contents=prompt,
                generation_config=config,
                tools=tools
            )
            
            # Process function calls from the API response
            results = process_function_calls(response, available_functions)
        except Exception as e:
            gemini_api_successful = False
            print(f"Note: Gemini API call failed: {e}")
            print("Using fallback function identification...")
        
        # If no function was called via API (or API failed), use our fallback logic
        function_called = any(part.get("type") == "function_result" for part in results)
        if not function_called:
            # Analyze the prompt to determine if we should call a function directly
            intent = analyze_prompt_intent(prompt)
            
            # If we can identify a specific function with high confidence, call it
            if intent["suggested_function"] and intent["confidence"] in ["high", "medium"]:
                function_name = intent["suggested_function"]
                
                if function_name == "summarize_youtube_video":
                    # Extract YouTube URL from prompt
                    import re
                    url_pattern = r'(https?://)?(www\.)?(youtube\.com/watch\?v=|youtu\.be/)[\w-]+'
                    match = re.search(url_pattern, prompt)
                    if match:
                        youtube_url = match.group(0)
                        try:
                            summary = available_functions[function_name](youtube_url, "medium")
                            results.append({
                                "type": "function_result",
                                "function": function_name,
                                "args": {"youtube_url": youtube_url, "summary_length": "medium"},
                                "result": summary,
                                "method": "fallback" if not gemini_api_successful else "api"
                            })
                        except Exception as e:
                            results.append({
                                "type": "function_error",
                                "function": function_name,
                                "error": str(e),
                                "method": "fallback"
                            })
                
                elif function_name == "summarize_text_content":
                    # Use the prompt itself as text to summarize
                    try:
                        # Extract the actual text to summarize from the prompt
                        text_to_summarize = prompt
                        # If the prompt contains "summarize this text:" or similar phrases, extract the text after that
                        import re
                        text_patterns = [
                            r'summarize this text:(.+)', 
                            r'summarize the following text:(.+)',
                            r'can you summarize this:(.+)',
                            r'please summarize:(.+)'
                        ]
                        
                        for pattern in text_patterns:
                            match = re.search(pattern, prompt, re.IGNORECASE | re.DOTALL)
                            if match:
                                text_to_summarize = match.group(1).strip()
                                break
                        
                        summary = available_functions[function_name](text_to_summarize, "medium")
                        results.append({
                            "type": "function_result", 
                            "function": function_name,
                            "args": {"text_content": text_to_summarize, "summary_length": "medium"},
                            "result": summary,
                            "method": "fallback" if not gemini_api_successful else "api"
                        })
                    except Exception as e:
                        results.append({
                            "type": "function_error",
                            "function": function_name,
                            "error": str(e),
                            "method": "fallback"
                        })
        
        return {"success": True, "results": results}
        
    except Exception as e:
        return {"success": False, "error": str(e)}


def analyze_prompt_intent(prompt: str) -> dict:
    """
    Analyze user prompt to determine intent and suggest appropriate function.
    
    Args:
        prompt: User's input prompt
        
    Returns:
        dict: Analysis of intent and suggested action
    """
    prompt_lower = prompt.lower()
    
    # Check for YouTube-related keywords
    youtube_patterns = ["youtube", "youtu.be", "video", "watch?v=", "/embed/"]
    if any(pattern in prompt_lower for pattern in youtube_patterns):
        return {
            "intent": "youtube_summary",
            "confidence": "high",
            "suggested_function": "summarize_youtube_video"
        }
    
    # Check for text summarization keywords
    text_patterns = ["summarize", "summary", "text", "article", "content"]
    if any(pattern in prompt_lower for pattern in text_patterns):
        return {
            "intent": "text_summary", 
            "confidence": "medium",
            "suggested_function": "summarize_text_content"
        }
    
    # Default to general chat
    return {
        "intent": "general_chat",
        "confidence": "low",
        "suggested_function": None
    }


if __name__ == "__main__":
    # Test the client setup
    try:
        model, config, tools = get_client_and_config()
        functions = register_functions()
        print(f"✅ Gemini client initialized successfully")
        print(f"📋 Available functions: {list(functions.keys())}")
        print(f"🔧 Tools configured: {len(tools)} tool(s)")
        
        # Test a simple prompt
        test_response = chat_with_functions("Hello, can you help me summarize some text?")
        print(f"🧪 Test response: {test_response}")
        
    except Exception as e:
        print(f"❌ Error testing Gemini client: {e}")