"""
Gemini client for function calling and intelligent content processing.
This module provides the main agent interface using Google's Gemini AI.
"""

import os
import json
from typing import Dict, Any, List
import google.generativeai as genai
from google.generativeai.types import GenerationConfig, SafetySetting, HarmCategory
from google.ai.generativelanguage_v1beta.types import content

# Import the content processing functions
from ..models.textsum_client import summarize_text_content
from ..models.youtube_client import summarize_youtube_video


class ContentProcessingAgent:
    """Agent for content processing using Gemini function calling"""
    
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-1.5-pro')
        
        # Available functions for the agent
        self.available_functions = {
            'summarize_text_content': self._summarize_text_wrapper,
            'summarize_youtube_video': self._summarize_youtube_wrapper,
            'extract_content_info': self._extract_content_info,
            'analyze_content_type': self._analyze_content_type
        }
        
        # Function definitions for Gemini
        self.function_definitions = [
            {
                "name": "summarize_text_content",
                "description": "Summarize text content with specified length",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "text_content": {
                            "type": "string",
                            "description": "The text content to summarize"
                        },
                        "summary_length": {
                            "type": "string",
                            "description": "Length of summary: 'short', 'medium', 'long', or number",
                            "default": "medium"
                        }
                    },
                    "required": ["text_content"]
                }
            },
            {
                "name": "summarize_youtube_video",
                "description": "Summarize a YouTube video by analyzing its transcript",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "youtube_url": {
                            "type": "string",
                            "description": "The YouTube video URL to summarize"
                        },
                        "summary_length": {
                            "type": "string",
                            "description": "Length of summary: 'short', 'medium', 'long', or number",
                            "default": "medium"
                        }
                    },
                    "required": ["youtube_url"]
                }
            },
            {
                "name": "extract_content_info",
                "description": "Extract key information from any content type",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "content": {
                            "type": "string",
                            "description": "The content to analyze"
                        },
                        "extract_type": {
                            "type": "string",
                            "description": "Type of extraction: 'summary', 'keywords', 'topics', 'sentiment'"
                        }
                    },
                    "required": ["content", "extract_type"]
                }
            },
            {
                "name": "analyze_content_type",
                "description": "Analyze and determine the type of content provided",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "input_text": {
                            "type": "string",
                            "description": "The input text or URL to analyze"
                        }
                    },
                    "required": ["input_text"]
                }
            }
        ]
    
    def _summarize_text_wrapper(self, text_content: str, summary_length: str = "medium") -> Dict[str, Any]:
        """Wrapper for text summarization"""
        try:
            summary = summarize_text_content(text_content, summary_length)
            return {
                "success": True,
                "summary": summary,
                "content_type": "text",
                "original_length": len(text_content.split()),
                "summary_length": summary_length
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "content_type": "text"
            }
    
    def _summarize_youtube_wrapper(self, youtube_url: str, summary_length: str = "medium") -> Dict[str, Any]:
        """Wrapper for YouTube video summarization"""
        try:
            summary = summarize_youtube_video(youtube_url, summary_length)
            return {
                "success": True,
                "summary": summary,
                "content_type": "youtube",
                "video_url": youtube_url,
                "summary_length": summary_length
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "content_type": "youtube",
                "video_url": youtube_url
            }
    
    def _extract_content_info(self, content: str, extract_type: str) -> Dict[str, Any]:
        """Extract specific information from content"""
        try:
            if extract_type == "summary":
                return self._summarize_text_wrapper(content, "medium")
            elif extract_type == "keywords":
                return self._extract_keywords(content)
            elif extract_type == "topics":
                return self._extract_topics(content)
            elif extract_type == "sentiment":
                return self._analyze_sentiment(content)
            else:
                return {
                    "success": False,
                    "error": f"Unknown extract_type: {extract_type}"
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "extract_type": extract_type
            }
    
    def _analyze_content_type(self, input_text: str) -> Dict[str, Any]:
        """Analyze and determine content type"""
        import re
        
        # Check for YouTube URLs
        youtube_patterns = [
            r'(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([^&\n?#]+)',
            r'youtube\.com/watch\?.*v=([^&\n?#]+)'
        ]
        
        for pattern in youtube_patterns:
            if re.search(pattern, input_text):
                return {
                    "success": True,
                    "content_type": "youtube",
                    "url": input_text,
                    "suggested_action": "summarize_youtube_video"
                }
        
        # Check for other URLs
        url_pattern = r'https?://[^\s]+'
        if re.search(url_pattern, input_text):
            return {
                "success": True,
                "content_type": "url",
                "url": input_text,
                "suggested_action": "extract_web_content"
            }
        
        # Default to text content
        return {
            "success": True,
            "content_type": "text",
            "suggested_action": "summarize_text_content"
        }
    
    def _extract_keywords(self, content: str) -> Dict[str, Any]:
        """Extract keywords from content"""
        try:
            # Simple keyword extraction
            import re
            from collections import Counter
            
            # Remove common stop words
            stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'}
            
            # Extract words
            words = re.findall(r'\b[a-zA-Z]{3,}\b', content.lower())
            words = [word for word in words if word not in stop_words]
            
            # Get most common words
            word_counts = Counter(words)
            keywords = [word for word, count in word_counts.most_common(10)]
            
            return {
                "success": True,
                "keywords": keywords,
                "extract_type": "keywords"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "extract_type": "keywords"
            }
    
    def _extract_topics(self, content: str) -> Dict[str, Any]:
        """Extract main topics from content"""
        try:
            # Simple topic extraction based on sentence structure
            sentences = content.split('.')
            topics = []
            
            for sentence in sentences[:5]:  # Take first 5 sentences
                sentence = sentence.strip()
                if len(sentence) > 20:  # Only consider substantial sentences
                    topics.append(sentence[:100] + "..." if len(sentence) > 100 else sentence)
            
            return {
                "success": True,
                "topics": topics,
                "extract_type": "topics"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "extract_type": "topics"
            }
    
    def _analyze_sentiment(self, content: str) -> Dict[str, Any]:
        """Analyze sentiment of content"""
        try:
            # Simple sentiment analysis based on positive/negative words
            positive_words = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'positive', 'love', 'like', 'happy', 'pleased']
            negative_words = ['bad', 'terrible', 'awful', 'horrible', 'negative', 'hate', 'dislike', 'sad', 'angry', 'disappointed']
            
            content_lower = content.lower()
            positive_count = sum(1 for word in positive_words if word in content_lower)
            negative_count = sum(1 for word in negative_words if word in content_lower)
            
            if positive_count > negative_count:
                sentiment = "positive"
            elif negative_count > positive_count:
                sentiment = "negative"
            else:
                sentiment = "neutral"
            
            return {
                "success": True,
                "sentiment": sentiment,
                "positive_score": positive_count,
                "negative_score": negative_count,
                "extract_type": "sentiment"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "extract_type": "sentiment"
            }
    
    def process_user_request(self, user_prompt: str) -> Dict[str, Any]:
        """Process user request using Gemini function calling"""
        try:
            # Create generation config
            generation_config = GenerationConfig(
                temperature=0.7,
                max_output_tokens=2048,
            )
            
            # Safety settings
            safety_settings = [
                SafetySetting(
                    category=HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold=SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
                ),
                SafetySetting(
                    category=HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold=SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
                ),
                SafetySetting(
                    category=HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold=SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
                ),
                SafetySetting(
                    category=HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold=SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
                ),
            ]
            
            # Create model with function declarations
            model = genai.GenerativeModel(
                'gemini-1.5-pro',
                tools=self.function_definitions,
                generation_config=generation_config,
                safety_settings=safety_settings
            )
            
            # Generate response
            response = model.generate_content(user_prompt)
            
            # Process function calls if any
            results = []
            
            if response.candidates[0].content.parts:
                for part in response.candidates[0].content.parts:
                    if hasattr(part, 'function_call') and part.function_call:
                        function_name = part.function_call.name
                        function_args = dict(part.function_call.args)
                        
                        if function_name in self.available_functions:
                            try:
                                function_result = self.available_functions[function_name](**function_args)
                                results.append({
                                    "type": "function_result",
                                    "function": function_name,
                                    "args": function_args,
                                    "result": function_result
                                })
                            except Exception as e:
                                results.append({
                                    "type": "function_error",
                                    "function": function_name,
                                    "args": function_args,
                                    "error": str(e)
                                })
                        else:
                            results.append({
                                "type": "unknown_function",
                                "function": function_name
                            })
                    elif hasattr(part, 'text') and part.text:
                        results.append({
                            "type": "text",
                            "content": part.text
                        })
            
            return {
                "success": True,
                "results": results,
                "response_id": getattr(response, 'response_id', None)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "results": []
            }


# Singleton instance
_agent_instance = None

def get_content_processing_agent():
    """Get or create the content processing agent instance"""
    global _agent_instance
    if _agent_instance is None:
        _agent_instance = ContentProcessingAgent()
    return _agent_instance


# Legacy compatibility functions
def get_client_and_config():
    """Legacy compatibility function"""
    try:
        agent = get_content_processing_agent()
        return agent.model, agent.generation_config if hasattr(agent, 'generation_config') else None
    except Exception:
        return None, None


def register_functions():
    """Legacy compatibility function"""
    try:
        agent = get_content_processing_agent()
        return agent.available_functions
    except Exception:
        return {}