"""Conversational Command Agent for DashPoint."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from typing import Any, Callable, Dict, Iterable, List, Optional, Pattern

from google.generativeai import GenerativeModel

from .gemini_client import get_client_and_config


CommandHandler = Callable[[List[str], Optional[Dict[str, Any]]], Dict[str, Any]]


@dataclass(frozen=True)
class CommandDefinition:
    """Specification of a conversational command."""

    name: str
    handler: CommandHandler
    patterns: Iterable[str]
    description: str

    def compile(self) -> "CompiledCommandDefinition":
        compiled = [re.compile(pattern, re.IGNORECASE) for pattern in self.patterns]
        return CompiledCommandDefinition(self.name, compiled, self.handler, self.description)


@dataclass(frozen=True)
class CompiledCommandDefinition:
    """Regex-ready command definition."""

    name: str
    patterns: List[Pattern[str]]
    handler: CommandHandler
    description: str

    def match(self, text: str) -> Optional[List[str]]:
        for pattern in self.patterns:
            match = pattern.search(text)
            if match:
                return list(match.groups())
        return None


@dataclass(frozen=True)
class CommandMatch:
    """Represents a resolved command from user input."""

    name: str
    parameters: List[str]
    confidence: float
    method: str


class ConversationalCommandAgent:
    """Agent that processes conversational commands and produces API intents."""

    _CONTRACTIONS = {
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
        "couldn't": "could not",
    }

    def __init__(self) -> None:
        self._model: Optional[GenerativeModel] = None
        self._initialize_ai()
        self._commands = self._build_commands()
        self._command_index = {command.name: command for command in self._commands}

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def process_command(
        self, user_input: str, user_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Process natural language and return an actionable response."""

        user_context = user_context or {}
        normalized_input = self._normalize_input(user_input)

        match = self._match_command(normalized_input)
        if match:
            return self._execute(match, user_context)

        ai_match = self._ai_understand_command(normalized_input)
        if ai_match:
            return self._execute(ai_match, user_context)

        fallback = CommandMatch(
            name="ask_ai",
            parameters=[normalized_input],
            confidence=0.6,
            method="fallback",
        )
        return self._execute(fallback, user_context)

    # ------------------------------------------------------------------
    # Command resolution helpers
    # ------------------------------------------------------------------
    def _match_command(self, text: str) -> Optional[CommandMatch]:
        for command in self._commands:
            parameters = command.match(text)
            if parameters is not None:
                return CommandMatch(
                    name=command.name,
                    parameters=parameters,
                    confidence=0.95,
                    method="pattern_match",
                )
        return None

    def _ai_understand_command(self, text: str) -> Optional[CommandMatch]:
        if not self._model:
            return None

        prompt = self._build_ai_prompt(text)
        try:
            response = self._model.generate_content(prompt)
        except Exception as exc:  # pragma: no cover - defensive logging path
            print(f"AI understanding failed: {exc}")
            return None

        payload = self._parse_ai_payload(response)
        if not payload:
            return None

        action_name = payload.get("action")
        if action_name not in self._command_index:
            return None

        parameters = payload.get("parameters") or []
        if not isinstance(parameters, list):
            parameters = [str(parameters)]

        confidence = payload.get("confidence", 0.75)
        try:
            confidence = float(confidence)
        except (TypeError, ValueError):
            confidence = 0.75

        return CommandMatch(
            name=action_name,
            parameters=[str(param) for param in parameters],
            confidence=max(0.0, min(confidence, 1.0)),
            method="ai_understanding",
        )

    def _execute(self, match: CommandMatch, user_context: Dict[str, Any]) -> Dict[str, Any]:
        command = self._command_index.get(match.name)
        if not command:
            return {
                "success": False,
                "action": "unknown",
                "message": "Command not recognized",
            }

        try:
            result = command.handler(match.parameters, user_context)
        except Exception as exc:  # pragma: no cover - runtime guard
            return {
                "success": False,
                "action": match.name,
                "error": str(exc),
                "message": f"Failed to execute {match.name}",
            }

        result["action"] = match.name
        result["confidence"] = match.confidence
        result["method"] = match.method
        return result

    # ------------------------------------------------------------------
    # AI utilities
    # ------------------------------------------------------------------
    def _initialize_ai(self) -> None:
        try:
            model, _config = get_client_and_config()
        except ValueError:
            self._model = None
        else:
            self._model = model

    @staticmethod
    def _build_ai_prompt(user_input: str) -> str:
        return (
            "You are an assistant that converts user commands into structured actions.\n"
            "Analyze the command and respond with only valid JSON using this schema:\n"
            "{\n"
            "  \"action\": \"<action_name>\",\n"
            "  \"parameters\": [\"param1\", \"param2\"],\n"
            "  \"confidence\": 0.0\n"
            "}\n"
            "Available actions and descriptions:\n"
            "- add_note: Add a sticky note or reminder\n"
            "- add_todo: Add a task to the todo list\n"
            "- complete_todo: Mark a task as completed\n"
            "- save_youtube: Save a YouTube video\n"
            "- summarize_youtube: Summarize a YouTube video\n"
            "- extract_content: Extract or summarize web content\n"
            "- upload_file: Upload or save a file\n"
            "- create_collection: Create a new collection\n"
            "- get_weather: Retrieve weather information\n"
            "- search: Search DashPoint content\n"
            "- ask_ai: General AI assistance\n"
            "User command: "
            f"{user_input!r}\n"
            "Respond with JSON only."
        )

    @staticmethod
    def _parse_ai_payload(response: Any) -> Optional[Dict[str, Any]]:
        raw_text = getattr(response, "text", "") or ""
        raw_text = raw_text.strip()
        if not raw_text:
            return None

        candidate = raw_text
        if "```" in raw_text:
            match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", raw_text, re.DOTALL)
            if match:
                candidate = match.group(1)

        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", candidate, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(0))
                except json.JSONDecodeError:
                    return None
        return None

    # ------------------------------------------------------------------
    # Input normalization
    # ------------------------------------------------------------------
    def _normalize_input(self, user_input: str) -> str:
        normalized = user_input.lower().strip()
        normalized = re.sub(r"\s+", " ", normalized)
        for contraction, expansion in self._CONTRACTIONS.items():
            normalized = normalized.replace(contraction, expansion)
        return normalized

    # ------------------------------------------------------------------
    # Command registry
    # ------------------------------------------------------------------
    def _build_commands(self) -> List[CompiledCommandDefinition]:
        definitions = [
            CommandDefinition(
                name="add_note",
                handler=self.add_sticky_note,
                patterns=[
                    r"add note\s+\"(.+?)\"",
                    r"create note\s+\"(.+?)\"",
                    r"new note\s+\"(.+?)\"",
                    r"add sticky note\s+\"(.+?)\"",
                    r"note:\s*(.+)",
                    r"remind me to\s+(.+)",
                    r"remember\s+(.+)",
                ],
                description="Add a sticky note or reminder",
            ),
            CommandDefinition(
                name="add_todo",
                handler=self.add_todo_item,
                patterns=[
                    r"add todo\s+\"(.+?)\"",
                    r"add task\s+\"(.+?)\"",
                    r"create task\s+\"(.+?)\"",
                    r"todo:\s*(.+)",
                    r"task:\s*(.+)",
                    r"i need to\s+(.+)",
                    r"add to my todo list\s+(.+)",
                ],
                description="Add an item to the todo list",
            ),
            CommandDefinition(
                name="complete_todo",
                handler=self.complete_todo_item,
                patterns=[
                    r"complete task\s+\"(.+?)\"",
                    r"mark done\s+\"(.+?)\"",
                    r"finish task\s+\"(.+?)\"",
                    r"completed\s+(.+)",
                    r"done with\s+(.+)",
                ],
                description="Mark a todo item as complete",
            ),
            CommandDefinition(
                name="save_youtube",
                handler=self.save_youtube_video,
                patterns=[
                    r"save youtube\s+(https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)[\w-]+)",
                    r"add youtube\s+(https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)[\w-]+)",
                    r"bookmark this video\s+(https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)[\w-]+)",
                    r"save video\s+(https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)[\w-]+)",
                ],
                description="Save a YouTube video",
            ),
            CommandDefinition(
                name="summarize_youtube",
                handler=self.summarize_youtube_video,
                patterns=[
                    r"summarize\s+(https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)[\w-]+)",
                    r"what is this video about\s+(https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)[\w-]+)",
                    r"explain this video\s+(https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)[\w-]+)",
                    r"analyze video\s+(https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)[\w-]+)",
                ],
                description="Summarize a YouTube video",
            ),
            CommandDefinition(
                name="extract_content",
                handler=self.extract_web_content,
                patterns=[
                    r"extract content from\s+(https?://[^\s]+)",
                    r"summarize this page\s+(https?://[^\s]+)",
                    r"analyze website\s+(https?://[^\s]+)",
                    r"what is on this page\s+(https?://[^\s]+)",
                ],
                description="Extract and analyze web content",
            ),
            CommandDefinition(
                name="upload_file",
                handler=self.upload_file,
                patterns=[
                    r"upload file\s+\"(.+?)\"",
                    r"save file\s+\"(.+?)\"",
                    r"add document\s+\"(.+?)\"",
                ],
                description="Upload a document",
            ),
            CommandDefinition(
                name="create_collection",
                handler=self.create_collection,
                patterns=[
                    r"create collection\s+\"(.+?)\"",
                    r"new collection\s+\"(.+?)\"",
                    r"make collection\s+\"(.+?)\"",
                ],
                description="Create a new collection",
            ),
            CommandDefinition(
                name="get_weather",
                handler=self.get_weather_info,
                patterns=[
                    r"weather for\s+(.+)",
                    r"what's the weather in\s+(.+)",
                    r"check weather\s+(.+)",
                    r"weather (.+)",
                ],
                description="Get weather information",
            ),
            CommandDefinition(
                name="search",
                handler=self.search_content,
                patterns=[
                    r"search for\s+\"(.+?)\"",
                    r"find\s+\"(.+?)\"",
                    r"look for\s+\"(.+?)\"",
                    r"search:\s*(.+)",
                ],
                description="Search for stored content",
            ),
            CommandDefinition(
                name="ask_ai",
                handler=self.ask_ai_assistant,
                patterns=[
                    r"ask ai\s+\"(.+?)\"",
                    r"ai help with\s+(.+)",
                    r"explain\s+(.+)",
                    r"what is\s+(.+)",
                    r"how to\s+(.+)",
                    r"help me\s+(.+)",
                ],
                description="General AI assistance",
            ),
        ]

        return [definition.compile() for definition in definitions]

    # ------------------------------------------------------------------
    # Action implementations
    # ------------------------------------------------------------------
    def add_sticky_note(
        self, parameters: List[str], user_context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        if not parameters:
            return {"success": False, "message": "No note content provided"}

        note_content = parameters[0]
        return {
            "success": True,
            "message": f"Added note: \"{note_content}\"",
            "api_call": {
                "endpoint": "/api/sticky-notes",
                "method": "POST",
                "data": {
                    "content": note_content,
                    "color": "yellow",
                    "priority": "medium",
                },
            },
        }

    def add_todo_item(
        self, parameters: List[str], user_context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        if not parameters:
            return {"success": False, "message": "No task content provided"}

        task_content = parameters[0]
        return {
            "success": True,
            "message": f"Added task: \"{task_content}\"",
            "api_call": {
                "endpoint": "/api/todos",
                "method": "POST",
                "data": {
                    "title": task_content,
                    "completed": False,
                    "priority": "medium",
                },
            },
        }

    def complete_todo_item(
        self, parameters: List[str], user_context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        if not parameters:
            return {"success": False, "message": "No task specified"}

        task_content = parameters[0]
        return {
            "success": True,
            "message": f"Marked as completed: \"{task_content}\"",
            "api_call": {
                "endpoint": "/api/todos/search-and-complete",
                "method": "PUT",
                "data": {
                    "search_term": task_content,
                    "completed": True,
                },
            },
        }

    def save_youtube_video(
        self, parameters: List[str], user_context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        if not parameters:
            return {"success": False, "message": "No YouTube URL provided"}

        youtube_url = parameters[0]
        return {
            "success": True,
            "message": f"Saving YouTube video: {youtube_url}",
            "api_call": {
                "endpoint": "/api/youtube/videos-enhanced",
                "method": "POST",
                "data": {
                    "url": youtube_url,
                    "generateSummary": True,
                    "summaryLength": "medium",
                },
            },
        }

    def summarize_youtube_video(
        self, parameters: List[str], user_context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        if not parameters:
            return {"success": False, "message": "No YouTube URL provided"}

        youtube_url = parameters[0]
        return {
            "success": True,
            "message": f"Analyzing YouTube video: {youtube_url}",
            "api_call": {
                "endpoint": "/api/youtube/process-with-ai",
                "method": "POST",
                "data": {
                    "youtube_url": youtube_url,
                    "processType": "analyze",
                    "saveToCollection": False,
                },
            },
        }

    def extract_web_content(
        self, parameters: List[str], user_context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        if not parameters:
            return {"success": False, "message": "No URL provided"}

        url = parameters[0]
        return {
            "success": True,
            "message": f"Extracting content from: {url}",
            "api_call": {
                "endpoint": "/api/content-extraction/process-with-ai",
                "method": "POST",
                "data": {"url": url, "processType": "analyze"},
            },
        }

    def upload_file(
        self, parameters: List[str], user_context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        if not parameters:
            return {"success": False, "message": "No file specified"}

        filename = parameters[0]
        return {
            "success": True,
            "message": f"Ready to upload file: {filename}",
            "api_call": {
                "endpoint": "/api/files/upload",
                "method": "POST",
                "data": {"filename": filename},
            },
        }

    def create_collection(
        self, parameters: List[str], user_context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        if not parameters:
            return {"success": False, "message": "No collection name provided"}

        collection_name = parameters[0]
        return {
            "success": True,
            "message": f"Creating collection: \"{collection_name}\"",
            "api_call": {
                "endpoint": "/api/collections",
                "method": "POST",
                "data": {
                    "name": collection_name,
                    "description": "Collection created via conversational command",
                },
            },
        }

    def get_weather_info(
        self, parameters: List[str], user_context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        if not parameters:
            return {"success": False, "message": "No location provided"}

        location = parameters[0]
        return {
            "success": True,
            "message": f"Getting weather for: {location}",
            "api_call": {
                "endpoint": "/api/weather",
                "method": "GET",
                "params": {"location": location},
            },
        }

    def search_content(
        self, parameters: List[str], user_context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        if not parameters:
            return {"success": False, "message": "No search query provided"}

        query = parameters[0]
        return {
            "success": True,
            "message": f"Searching for: \"{query}\"",
            "api_call": {
                "endpoint": "/api/search",
                "method": "GET",
                "params": {"q": query},
            },
        }

    def ask_ai_assistant(
        self, parameters: List[str], user_context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        if not parameters:
            return {"success": False, "message": "No question provided"}

        question = parameters[0]
        return {
            "success": True,
            "message": f"Processing AI request: \"{question}\"",
            "api_call": {
                "endpoint": "/api/ai-services/chat",
                "method": "POST",
                "data": {"message": question, "context": "general_assistance"},
            },
        }


_conversational_agent: Optional[ConversationalCommandAgent] = None


def get_conversational_agent() -> ConversationalCommandAgent:
    """Return a singleton conversational agent instance."""

    global _conversational_agent
    if _conversational_agent is None:
        _conversational_agent = ConversationalCommandAgent()
    return _conversational_agent
