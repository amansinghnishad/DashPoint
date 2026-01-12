"""Optional AI intent extraction helpers (Gemini)."""

from __future__ import annotations

import json
import os
import re
from typing import Any, Dict, Optional

try:  # Optional dependency
    import google.generativeai as genai
    from google.generativeai import GenerativeModel
except Exception:  # pragma: no cover
    genai = None  # type: ignore
    GenerativeModel = None  # type: ignore


def initialize_model() -> Optional[Any]:
    """Return a Gemini model for intent classification, or None."""

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or genai is None or GenerativeModel is None:
        return None

    try:
        genai.configure(api_key=api_key)
        model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-pro")
        return GenerativeModel(model_name)
    except Exception:
        return None


def build_ai_prompt(user_input: str) -> str:
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


def parse_ai_payload(response: Any) -> Optional[Dict[str, Any]]:
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
