"""ConversationalCommandAgent core implementation.

This is intentionally split from the public façade module (utils.agents.conversational_agent)
so that the façade can stay stable while the internals remain modular.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from .ai_intent import build_ai_prompt, initialize_model, parse_ai_payload
from .handlers_actions import ActionHandlers
from .handlers_assistant import AssistantHandlers
from .handlers_schedule import ScheduleHandlers
from .models import CommandDefinition, CommandMatch, CompiledCommandDefinition
from .normalization import normalize_input


class ConversationalCommandAgent(ScheduleHandlers, ActionHandlers, AssistantHandlers):
    """Agent that processes conversational commands and produces API intents."""

    def __init__(self) -> None:
        self._model: Optional[Any] = initialize_model()
        self._commands = self._build_commands()
        self._command_index = {command.name: command for command in self._commands}

    def process_command(
        self, user_input: str, user_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Process natural language and return an actionable response."""

        user_context = user_context or {}
        normalized_input = normalize_input(user_input)

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

        prompt = build_ai_prompt(text)
        try:
            response = self._model.generate_content(prompt)
        except Exception as exc:  # pragma: no cover
            print(f"AI understanding failed: {exc}")
            return None

        payload = parse_ai_payload(response)
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
        except Exception as exc:  # pragma: no cover
            return {
                "success": False,
                "action": match.name,
                "error": str(exc),
                "message": f"Failed to execute {match.name}",
            }

        result["action"] = match.name
        result["confidence"] = match.confidence
        result["method"] = match.method

        if "changes_required" not in result:
            result["changes_required"] = bool(result.get("api_call"))
        result.setdefault("proposal", None)
        return result

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
