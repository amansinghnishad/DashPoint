"""Conversational Command Agent for DashPoint."""

from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass
from typing import Any, Callable, Dict, Iterable, List, Optional, Pattern

try:  # Optional dependency
    import google.generativeai as genai
    from google.generativeai import GenerativeModel
except Exception:  # pragma: no cover
    genai = None  # type: ignore
    GenerativeModel = None  # type: ignore


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
        self._model: Optional[Any] = None
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
        # Conversational agent can work purely via pattern matching.
        # If Gemini is configured, we use it only for intent classification.
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or genai is None or GenerativeModel is None:
            self._model = None
            return

        try:
            genai.configure(api_key=api_key)
            model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-pro")
            # No tool schema here: only JSON intent extraction.
            self._model = GenerativeModel(model_name)
        except Exception:
            self._model = None

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
            "- add_planner_widget: Add a planner widget to a collection\n"
            "- get_weather: Retrieve weather information\n"
            "- search: Search DashPoint content\n"
            "- schedule_calendar: Schedule a focused time block on the calendar\n"
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
                name="add_planner_widget",
                handler=self.add_planner_widget_to_collection,
                patterns=[
                    r"add\s+([\w\s-]+?)\s+(?:widget|panel)\s+to\s+(?:my\s+)?collection\s+\"(.+?)\"",
                    r"add\s+([\w\s-]+?)\s+(?:widget|panel)\s+to\s+(?:the\s+)?\"(.+?)\"\s+collection",
                    r"add\s+([\w\s-]+?)\s+(?:widget|panel)\s+to\s+(.+?)\s+collection",
                    r"put\s+([\w\s-]+?)\s+(?:widget|panel)\s+in\s+(.+?)\s+collection",
                ],
                description="Create a planner widget and attach it to a collection",
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
                name="schedule_calendar",
                handler=self.schedule_calendar_block,
                patterns=[
                    r"(?:schedule|book|plan)\s+(.+)",
                    r"create\s+(?:a\s+)?(?:calendar\s+)?(?:event|block)\s+(.+)",
                    r"set up\s+(.+)",
                    r"(?:practice|work on)\s+(.+)",
                ],
                description="Schedule a focused time block on the calendar",
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

    @staticmethod
    def _normalize_widget_type(raw: str) -> Optional[str]:
        value = (raw or "").strip().lower()
        value = re.sub(r"\s+", " ", value)
        aliases = {
            "top priorities": "top-priorities",
            "top-priority": "top-priorities",
            "priorities": "top-priorities",
            "todo": "todo-list",
            "to do": "todo-list",
            "to-do": "todo-list",
            "todo list": "todo-list",
            "tasks": "todo-list",
            "task list": "todo-list",
            "appointments": "appointments",
            "calendar": "appointments",
            "daily schedule": "daily-schedule",
            "schedule": "daily-schedule",
            "goals": "goals",
            "notes": "notes",
            "tomorrow notes": "notes-tomorrow",
            "notes tomorrow": "notes-tomorrow",
        }
        if value in aliases:
            return aliases[value]

        # already normalized (e.g. "todo-list")
        if value in {
            "top-priorities",
            "todo-list",
            "appointments",
            "daily-schedule",
            "goals",
            "notes",
            "notes-tomorrow",
        }:
            return value

        return None

    @staticmethod
    def _resolve_collection_id(
        user_context: Optional[Dict[str, Any]],
        collection_hint: Optional[str],
    ) -> Optional[str]:
        if not isinstance(user_context, dict):
            return None

        # Prefer explicitly selected collection if client/server provides it
        for key in ("activeCollectionId", "collectionId", "collection_id"):
            value = user_context.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()

        collections = user_context.get("collections")
        if not isinstance(collections, list):
            return None

        hint = (collection_hint or "").strip().lower()
        if not hint:
            return None

        # Exact name match (case-insensitive)
        for c in collections:
            if not isinstance(c, dict):
                continue
            name = str(c.get("name") or "").strip().lower()
            cid = str(c.get("id") or "").strip()
            if name and cid and name == hint:
                return cid

        # Contains match
        for c in collections:
            if not isinstance(c, dict):
                continue
            name = str(c.get("name") or "").strip().lower()
            cid = str(c.get("id") or "").strip()
            if name and cid and hint in name:
                return cid

        return None

    def schedule_calendar_block(
        self, parameters: List[str], user_context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Produce an API call for /api/calendar/google/schedule.

        This is intentionally conservative: it schedules within a nearby window
        (default: next 7 days) and relies on the server-side scheduler to find
        an actual free slot.
        """

        from datetime import datetime, timedelta, timezone

        if not parameters:
            return {"success": False, "message": "No scheduling request provided"}

        raw = (parameters[0] or "").strip()
        if not raw:
            return {"success": False, "message": "No scheduling request provided"}

        # Duration parsing (default: 60 minutes)
        duration_minutes = 60
        duration_match = re.search(r"(\d+)\s*(hours?|hrs?|hr|minutes?|mins?|min)\b", raw, re.IGNORECASE)
        if duration_match:
            qty = int(duration_match.group(1))
            unit = duration_match.group(2).lower()
            if unit.startswith("hour") or unit.startswith("hr"):
                duration_minutes = max(5, min(qty * 60, 8 * 60))
            else:
                duration_minutes = max(5, min(qty, 8 * 60))

        # Calendar window.
        # We intentionally generate ISO8601 without a timezone suffix so the server
        # (running on the same machine) interprets it in local time.
        now_local = datetime.now()
        time_min = now_local
        time_max = now_local + timedelta(days=7)

        lower = raw.lower()
        if "tomorrow" in lower:
            tomorrow = (now_local + timedelta(days=1)).date()
            time_min = datetime(tomorrow.year, tomorrow.month, tomorrow.day, 0, 0, 0)
            time_max = time_min + timedelta(days=1)
        elif "today" in lower:
            today = now_local.date()
            time_min = datetime(today.year, today.month, today.day, 0, 0, 0)
            time_max = time_min + timedelta(days=1)

        # Explicit time parsing: "at 8pm", "at 20:30", etc.
        # If present, narrow the window to exactly the requested slot.
        time_match = re.search(
            r"\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b",
            lower,
            re.IGNORECASE,
        )
        if time_match:
            hh = int(time_match.group(1))
            mm = int(time_match.group(2) or 0)
            ampm = (time_match.group(3) or "").lower()
            if ampm:
                if hh == 12:
                    hh = 0
                if ampm == "pm":
                    hh += 12

            # Choose date: today if time is in the future, else tomorrow.
            target_date = now_local.date()
            if "tomorrow" in lower:
                target_date = (now_local + timedelta(days=1)).date()
            elif "today" in lower:
                target_date = now_local.date()
            else:
                candidate_dt = datetime(target_date.year, target_date.month, target_date.day, hh, mm, 0)
                if candidate_dt <= now_local:
                    target_date = (now_local + timedelta(days=1)).date()

            slot_start = datetime(target_date.year, target_date.month, target_date.day, hh, mm, 0)
            slot_end = slot_start + timedelta(minutes=duration_minutes)
            time_min = slot_start
            time_max = slot_end

        # Strategy hints
        conflict_strategy = "auto"
        if "split" in lower:
            conflict_strategy = "split"
        elif "shorten" in lower or "shorter" in lower:
            conflict_strategy = "shorten"
        elif "next window" in lower or "next-window" in lower:
            conflict_strategy = "next-window"

        # dashpointColor + Google Calendar colorId mapping from plain language.
        dashpoint_color = None
        color_id = None
        if "color" in lower or "colour" in lower:
            if re.search(r"\b(red|crimson|maroon|tomato)\b", lower):
                dashpoint_color = "danger"
                color_id = "11"
            elif re.search(r"\b(green|emerald)\b", lower):
                dashpoint_color = "success"
                color_id = "10"
            elif re.search(r"\b(yellow|amber|gold)\b", lower):
                dashpoint_color = "warning"
                color_id = "5"
            elif re.search(r"\b(blue|purple|violet|indigo)\b", lower):
                dashpoint_color = "info"
                # Prefer blue-ish id if user asked blue; otherwise purple-ish.
                color_id = "9" if re.search(r"\bblue\b", lower) else "3"
            elif re.search(r"\b(orange|tangerine)\b", lower):
                dashpoint_color = "warning"
                color_id = "6"
            elif re.search(r"\b(pink|flamingo)\b", lower):
                dashpoint_color = "danger"
                color_id = "4"
            elif re.search(r"\b(gray|grey|graphite)\b", lower):
                dashpoint_color = "info"
                color_id = "8"

        # Title extraction: prefer quoted title, else derive from the sentence.
        title = "Focus Block"
        quoted = re.search(r'\"([^\"]{1,200})\"', raw)
        if quoted:
            title = quoted.group(1)
        else:
            candidate = raw
            # Drop leading verbs
            candidate = re.sub(r"^(schedule|book|plan|create|set up|practice|work on)\s+", "", candidate, flags=re.IGNORECASE).strip()
            # Remove explicit duration
            candidate = re.sub(r"\b(\d+)\s*(hours?|hrs?|hr|minutes?|mins?|min)\b", "", candidate, flags=re.IGNORECASE)
            # Remove common time hints
            candidate = re.sub(r"\b(today|tomorrow|tonight)\b", "", candidate, flags=re.IGNORECASE)
            candidate = re.sub(r"\bat\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?\b", "", candidate, flags=re.IGNORECASE)
            # Remove dangling connectors
            candidate = re.sub(r"\bfor\b", " ", candidate, flags=re.IGNORECASE)
            candidate = re.sub(r"\bcolor\b\s+\w+", " ", candidate, flags=re.IGNORECASE)
            candidate = re.sub(r"\s+", " ", candidate).strip(" -:")
            if candidate:
                title = candidate[:200]

        user_tz = None
        if isinstance(user_context, dict):
            user_tz = user_context.get("timezone")

        payload: Dict[str, Any] = {
            "title": title,
            "durationMinutes": duration_minutes,
            "timeMin": time_min.replace(microsecond=0).isoformat(),
            "timeMax": time_max.replace(microsecond=0).isoformat(),
            "conflictStrategy": conflict_strategy,
            "createEvents": True,
            "dashpointType": "skill-practice",
        }
        if dashpoint_color:
            payload["dashpointColor"] = dashpoint_color
        if color_id:
            payload["colorId"] = color_id
        if user_tz:
            payload["timezone"] = str(user_tz)

        # A structured, UI-friendly summary of what we understood.
        proposal: Dict[str, Any] = {
            "type": "schedule",
            "title": title,
            "durationMinutes": duration_minutes,
            "timeMin": payload["timeMin"],
            "timeMax": payload["timeMax"],
            "conflictStrategy": conflict_strategy,
            "createEvents": True,
            "dashpointType": payload["dashpointType"],
            "dashpointColor": payload.get("dashpointColor"),
            "colorId": payload.get("colorId"),
            "timezone": payload.get("timezone"),
        }

        return {
            "success": True,
            "message": f"Scheduling {duration_minutes} minutes: {title}",
            "proposal": proposal,
            "api_call": {
                "endpoint": "/api/calendar/google/schedule",
                "method": "POST",
                "data": payload,
            },
        }

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

    def add_planner_widget_to_collection(
        self, parameters: List[str], user_context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        if not parameters or len(parameters) < 1:
            return {"success": False, "message": "No widget type provided"}

        raw_widget = parameters[0]
        collection_hint = parameters[1] if len(parameters) > 1 else None

        widget_type = self._normalize_widget_type(raw_widget)
        if not widget_type:
            return {
                "success": False,
                "message": (
                    "Unknown widget type. Supported: top-priorities, todo-list, appointments, "
                    "daily-schedule, goals, notes, notes-tomorrow."
                ),
            }

        collection_id = self._resolve_collection_id(user_context, collection_hint)
        if not collection_id:
            return {
                "success": False,
                "message": (
                    "Which collection should I add it to? "
                    "Say e.g. 'add todo widget to \"Work\" collection'."
                ),
            }

        return {
            "success": True,
            "message": f"Adding {widget_type} widget to your collection.",
            "api_call": {
                "endpoint": f"/api/collections/{collection_id}/planner-widgets",
                "method": "POST",
                "data": {
                    "widgetType": widget_type,
                    "title": "",
                    "data": {},
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
