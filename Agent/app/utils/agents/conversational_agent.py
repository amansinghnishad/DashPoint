"""
Conversational Command Agent for DashPoint
This agent interprets natural language commands and executes appropriate actions automatically.
"""

import re
import json
from typing import Dict, Any, List, Optional
from datetime import datetime
import google.generativeai as genai
from google.generativeai.types import GenerationConfig

class ConversationalCommandAgent:
    """Agent that processes conversational commands and executes actions"""
    
    def __init__(self):
        self.api_key = None
        self.model = None
        self.initialize_ai()
        
        # Command patterns and their corresponding actions
        self.command_patterns = {
            # Notes and sticky notes
            'add_note': [
                r'add note\s+["\'](.+?)["\']',
                r'create note\s+["\'](.+?)["\']',
                r'new note\s+["\'](.+?)["\']',
                r'add sticky note\s+["\'](.+?)["\']',
                r'note:\s*(.+)',
                r'remind me to\s+(.+)',
                r'remember\s+(.+)'
            ],
            
            # Todo items
            'add_todo': [
                r'add todo\s+["\'](.+?)["\']',
                r'add task\s+["\'](.+?)["\']',
                r'create task\s+["\'](.+?)["\']',
                r'todo:\s*(.+)',
                r'task:\s*(.+)',
                r'i need to\s+(.+)',
                r'add to my todo list\s+(.+)'
            ],
            
            # Complete tasks
            'complete_todo': [
                r'complete task\s+["\'](.+?)["\']',
                r'mark done\s+["\'](.+?)["\']',
                r'finish task\s+["\'](.+?)["\']',
                r'completed\s+(.+)',
                r'done with\s+(.+)'
            ],
            
            # YouTube operations
            'save_youtube': [
                r'save youtube\s+(https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)[\w-]+)',
                r'add youtube\s+(https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)[\w-]+)',
                r'bookmark this video\s+(https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)[\w-]+)',
                r'save video\s+(https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)[\w-]+)'
            ],
            
            'summarize_youtube': [
                r'summarize\s+(https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)[\w-]+)',
                r'what is this video about\s+(https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)[\w-]+)',
                r'explain this video\s+(https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)[\w-]+)',
                r'analyze video\s+(https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)[\w-]+)'
            ],
            
            # Web content operations
            'extract_content': [
                r'extract content from\s+(https?://[^\s]+)',
                r'summarize this page\s+(https?://[^\s]+)',
                r'analyze website\s+(https?://[^\s]+)',
                r'what is on this page\s+(https?://[^\s]+)'
            ],
            
            # File operations
            'upload_file': [
                r'upload file\s+["\'](.+?)["\']',
                r'save file\s+["\'](.+?)["\']',
                r'add document\s+["\'](.+?)["\']'
            ],
            
            # Collections
            'create_collection': [
                r'create collection\s+["\'](.+?)["\']',
                r'new collection\s+["\'](.+?)["\']',
                r'make collection\s+["\'](.+?)["\']'
            ],
            
            # Weather
            'get_weather': [
                r'weather for\s+(.+)',
                r'what\'s the weather in\s+(.+)',
                r'check weather\s+(.+)',
                r'weather (.+)'
            ],
            
            # Search operations
            'search': [
                r'search for\s+["\'](.+?)["\']',
                r'find\s+["\'](.+?)["\']',
                r'look for\s+["\'](.+?)["\']',
                r'search:\s*(.+)'
            ],
            
            # AI assistance
            'ask_ai': [
                r'ask ai\s+["\'](.+?)["\']',
                r'ai help with\s+(.+)',
                r'explain\s+(.+)',
                r'what is\s+(.+)',
                r'how to\s+(.+)',
                r'help me\s+(.+)'
            ]
        }
        
        # Function mappings for API calls
        self.action_functions = {
            'add_note': self.add_sticky_note,
            'add_todo': self.add_todo_item,
            'complete_todo': self.complete_todo_item,
            'save_youtube': self.save_youtube_video,
            'summarize_youtube': self.summarize_youtube_video,
            'extract_content': self.extract_web_content,
            'upload_file': self.upload_file,
            'create_collection': self.create_collection,
            'get_weather': self.get_weather_info,
            'search': self.search_content,
            'ask_ai': self.ask_ai_assistant
        }
    
    def initialize_ai(self):
        """Initialize the AI model for advanced command understanding"""
        import os
        try:
            self.api_key = os.getenv('GEMINI_API_KEY')
            if self.api_key:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-1.5-pro')
        except Exception as e:
            print(f"AI initialization failed: {e}")
            self.model = None
    
    def process_command(self, user_input: str, user_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Process a natural language command and execute the appropriate action
        
        Args:
            user_input (str): The natural language command from the user
            user_context (dict): User context including user_id, preferences, etc.
        
        Returns:
            dict: Result of the command execution
        """
        try:
            # Clean and normalize the input
            normalized_input = self.normalize_input(user_input)
            
            # First try pattern matching for speed
            pattern_result = self.match_command_patterns(normalized_input)
            
            if pattern_result['action'] != 'unknown':
                return self.execute_action(pattern_result, user_context)
            
            # If pattern matching fails, use AI for understanding
            if self.model:
                ai_result = self.ai_understand_command(normalized_input)
                if ai_result['action'] != 'unknown':
                    return self.execute_action(ai_result, user_context)
            
            # If all else fails, treat as general AI question
            return self.execute_action({
                'action': 'ask_ai',
                'parameters': [normalized_input],
                'confidence': 0.7
            }, user_context)
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'action': 'error',
                'message': 'Failed to process command'
            }
    
    def normalize_input(self, user_input: str) -> str:
        """Normalize user input for better matching"""
        # Convert to lowercase and strip whitespace
        normalized = user_input.lower().strip()
        
        # Remove extra spaces
        normalized = re.sub(r'\s+', ' ', normalized)
        
        # Handle common contractions
        contractions = {
            "i'm": "i am",
            "i'll": "i will",
            "i'd": "i would",
            "i've": "i have",
            "you're": "you are",
            "you'll": "you will",
            "you'd": "you would",
            "you've": "you have",
            "he's": "he is",
            "she's": "she is",
            "it's": "it is",
            "we're": "we are",
            "we'll": "we will",
            "we'd": "we would",
            "we've": "we have",
            "they're": "they are",
            "they'll": "they will",
            "they'd": "they would",
            "they've": "they have",
            "can't": "cannot",
            "won't": "will not",
            "don't": "do not",
            "doesn't": "does not",
            "didn't": "did not",
            "haven't": "have not",
            "hasn't": "has not",
            "hadn't": "had not",
            "wouldn't": "would not",
            "shouldn't": "should not",
            "couldn't": "could not"
        }
        
        for contraction, expansion in contractions.items():
            normalized = normalized.replace(contraction, expansion)
        
        return normalized
    
    def match_command_patterns(self, normalized_input: str) -> Dict[str, Any]:
        """Match input against predefined command patterns"""
        for action, patterns in self.command_patterns.items():
            for pattern in patterns:
                match = re.search(pattern, normalized_input, re.IGNORECASE)
                if match:
                    return {
                        'action': action,
                        'parameters': list(match.groups()),
                        'confidence': 0.95,
                        'method': 'pattern_match'
                    }
        
        return {
            'action': 'unknown',
            'parameters': [],
            'confidence': 0.0,
            'method': 'pattern_match'
        }
    
    def ai_understand_command(self, user_input: str) -> Dict[str, Any]:
        """Use AI to understand complex or ambiguous commands"""
        if not self.model:
            return {'action': 'unknown', 'parameters': [], 'confidence': 0.0}
        
        try:
            prompt = f"""
            Analyze this user command and determine what action they want to perform.
            
            User command: "{user_input}"
            
            Available actions:
            - add_note: Add a sticky note or reminder
            - add_todo: Add a task to todo list
            - complete_todo: Mark a task as completed
            - save_youtube: Save a YouTube video to collection
            - summarize_youtube: Summarize a YouTube video
            - extract_content: Extract and analyze web content
            - upload_file: Upload or save a file
            - create_collection: Create a new collection
            - get_weather: Get weather information
            - search: Search for content
            - ask_ai: General AI assistance or questions
            
            Return ONLY a JSON object with this format:
            {{
                "action": "action_name",
                "parameters": ["extracted_parameter1", "extracted_parameter2"],
                "confidence": 0.8
            }}
            
            Extract the relevant parameters from the user input. For example:
            - For notes: extract the note content
            - For URLs: extract the full URL
            - For locations: extract the location name
            - For search: extract the search query
            """
            
            response = self.model.generate_content(prompt)
            
            try:
                result = json.loads(response.text.strip())
                result['method'] = 'ai_understanding'
                return result
            except json.JSONDecodeError:
                return {'action': 'unknown', 'parameters': [], 'confidence': 0.0}
                
        except Exception as e:
            print(f"AI understanding failed: {e}")
            return {'action': 'unknown', 'parameters': [], 'confidence': 0.0}
    
    def execute_action(self, action_result: Dict[str, Any], user_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Execute the determined action"""
        action = action_result['action']
        parameters = action_result.get('parameters', [])
        
        if action in self.action_functions:
            try:
                result = self.action_functions[action](parameters, user_context)
                result['action'] = action
                result['confidence'] = action_result.get('confidence', 0.8)
                result['method'] = action_result.get('method', 'unknown')
                return result
            except Exception as e:
                return {
                    'success': False,
                    'error': str(e),
                    'action': action,
                    'message': f'Failed to execute {action}'
                }
        else:
            return {
                'success': False,
                'action': 'unknown',
                'message': 'Command not recognized'
            }
    
    # Action implementation methods
    def add_sticky_note(self, parameters: List[str], user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Add a sticky note"""
        if not parameters:
            return {'success': False, 'message': 'No note content provided'}
        
        note_content = parameters[0]
        return {
            'success': True,
            'message': f'Added note: "{note_content}"',
            'api_call': {
                'endpoint': '/api/sticky-notes',
                'method': 'POST',
                'data': {
                    'content': note_content,
                    'color': 'yellow',
                    'priority': 'medium'
                }
            }
        }
    
    def add_todo_item(self, parameters: List[str], user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Add a todo item"""
        if not parameters:
            return {'success': False, 'message': 'No task content provided'}
        
        task_content = parameters[0]
        return {
            'success': True,
            'message': f'Added task: "{task_content}"',
            'api_call': {
                'endpoint': '/api/todos',
                'method': 'POST',
                'data': {
                    'title': task_content,
                    'completed': False,
                    'priority': 'medium'
                }
            }
        }
    
    def complete_todo_item(self, parameters: List[str], user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Complete a todo item"""
        if not parameters:
            return {'success': False, 'message': 'No task specified'}
        
        task_content = parameters[0]
        return {
            'success': True,
            'message': f'Marked as completed: "{task_content}"',
            'api_call': {
                'endpoint': '/api/todos/search-and-complete',
                'method': 'PUT',
                'data': {
                    'search_term': task_content,
                    'completed': True
                }
            }
        }
    
    def save_youtube_video(self, parameters: List[str], user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Save a YouTube video"""
        if not parameters:
            return {'success': False, 'message': 'No YouTube URL provided'}
        
        youtube_url = parameters[0]
        return {
            'success': True,
            'message': f'Saving YouTube video: {youtube_url}',
            'api_call': {
                'endpoint': '/api/youtube/videos-enhanced',
                'method': 'POST',
                'data': {
                    'url': youtube_url,
                    'generateSummary': True,
                    'summaryLength': 'medium'
                }
            }
        }
    
    def summarize_youtube_video(self, parameters: List[str], user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Summarize a YouTube video"""
        if not parameters:
            return {'success': False, 'message': 'No YouTube URL provided'}
        
        youtube_url = parameters[0]
        return {
            'success': True,
            'message': f'Analyzing YouTube video: {youtube_url}',
            'api_call': {
                'endpoint': '/api/youtube/process-with-ai',
                'method': 'POST',
                'data': {
                    'youtube_url': youtube_url,
                    'processType': 'analyze',
                    'saveToCollection': False
                }
            }
        }
    
    def extract_web_content(self, parameters: List[str], user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Extract content from a web page"""
        if not parameters:
            return {'success': False, 'message': 'No URL provided'}
        
        url = parameters[0]
        return {
            'success': True,
            'message': f'Extracting content from: {url}',
            'api_call': {
                'endpoint': '/api/content-extraction/process-with-ai',
                'method': 'POST',
                'data': {
                    'url': url,
                    'processType': 'analyze'
                }
            }
        }
    
    def upload_file(self, parameters: List[str], user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Handle file upload"""
        if not parameters:
            return {'success': False, 'message': 'No file specified'}
        
        filename = parameters[0]
        return {
            'success': True,
            'message': f'Ready to upload file: {filename}',
            'api_call': {
                'endpoint': '/api/files/upload',
                'method': 'POST',
                'data': {
                    'filename': filename
                }
            }
        }
    
    def create_collection(self, parameters: List[str], user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new collection"""
        if not parameters:
            return {'success': False, 'message': 'No collection name provided'}
        
        collection_name = parameters[0]
        return {
            'success': True,
            'message': f'Creating collection: "{collection_name}"',
            'api_call': {
                'endpoint': '/api/collections',
                'method': 'POST',
                'data': {
                    'name': collection_name,
                    'description': f'Collection created via conversational command'
                }
            }
        }
    
    def get_weather_info(self, parameters: List[str], user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Get weather information"""
        if not parameters:
            return {'success': False, 'message': 'No location provided'}
        
        location = parameters[0]
        return {
            'success': True,
            'message': f'Getting weather for: {location}',
            'api_call': {
                'endpoint': '/api/weather',
                'method': 'GET',
                'params': {
                    'location': location
                }
            }
        }
    
    def search_content(self, parameters: List[str], user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Search for content"""
        if not parameters:
            return {'success': False, 'message': 'No search query provided'}
        
        query = parameters[0]
        return {
            'success': True,
            'message': f'Searching for: "{query}"',
            'api_call': {
                'endpoint': '/api/search',
                'method': 'GET',
                'params': {
                    'q': query
                }
            }
        }
    
    def ask_ai_assistant(self, parameters: List[str], user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Handle general AI assistance"""
        if not parameters:
            return {'success': False, 'message': 'No question provided'}
        
        question = parameters[0]
        return {
            'success': True,
            'message': f'Processing AI request: "{question}"',
            'api_call': {
                'endpoint': '/api/ai-services/chat',
                'method': 'POST',
                'data': {
                    'message': question,
                    'context': 'general_assistance'
                }
            }
        }


# Singleton instance
_conversational_agent = None

def get_conversational_agent():
    """Get or create the conversational command agent instance"""
    global _conversational_agent
    if _conversational_agent is None:
        _conversational_agent = ConversationalCommandAgent()
    return _conversational_agent
