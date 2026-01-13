"""General assistant response handler (non-action chat)."""

from __future__ import annotations

import re
from typing import Any, Dict, List, Optional


class AssistantHandlers:
    _model: Optional[Any]

    def ask_ai_assistant(
        self, parameters: List[str], user_context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        if not parameters:
            return {"success": False, "message": "No question provided"}

        question = str(parameters[0] or "").strip()
        lower = question.lower()

        if re.match(r"^(hi|hello|hey|yo|good\s+(morning|afternoon|evening))\b", lower):
            return {
                "success": True,
                "changes_required": False,
                "message": (
                    "Hi! I'm your DashPoint Assistant.\n"
                    "Tell me what you want to do and I’ll help.\n"
                    "Examples: /schedule focus block tomorrow 3pm for 30m, /todo finish report, /notes remember to call Sam."
                ),
            }

        if getattr(self, "_model", None):
            try:
                persona = (
                    "You are DashPoint Assistant, a friendly productivity assistant. "
                    "Answer naturally like a helpful human assistant. "
                    "If the user asks to create or change anything (calendar, notes, todos, collections), "
                    "explain what you would do and ask them to confirm or use the relevant slash command. "
                    "Keep responses concise and actionable."
                )

                response = self._model.generate_content(
                    f"{persona}\n\nUser: {question}\nDashPoint Assistant:"
                )
                text = (getattr(response, "text", "") or "").strip()
                if text:
                    if not text.lower().startswith("as your dashpoint assistant") and not text.lower().startswith(
                        "dashpoint assistant"
                    ):
                        text = (
                            f"As your DashPoint Assistant, {text[0].lower()}{text[1:]}"
                            if len(text) > 1
                            else "As your DashPoint Assistant, " + text
                        )

                    return {
                        "success": True,
                        "changes_required": False,
                        "message": text,
                    }
            except Exception as exc:  # pragma: no cover
                print(f"ask_ai_assistant failed: {exc}")

        return {
            "success": True,
            "changes_required": False,
            "message": (
                "As your DashPoint Assistant, I can help with planning, summaries, and quick guidance.\n"
                "If you want me to *do* something in DashPoint (schedule / todo / notes), use a command like: "
                "/schedule, /meeting, /todo, /notes.\n"
                f"What would you like to do about: {question!r}?"
            ),
        }
