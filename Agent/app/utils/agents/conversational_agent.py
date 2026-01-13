"""Public façade for DashPoint's conversational agent.

This module stays import-stable for the rest of the app (e.g. main.py), while the
implementation lives in utils.agents.conversational.*.
"""

from __future__ import annotations

from typing import Optional

from .conversational.core import ConversationalCommandAgent


_conversational_agent: Optional[ConversationalCommandAgent] = None


def get_conversational_agent() -> ConversationalCommandAgent:
    """Return a singleton conversational agent instance."""

    global _conversational_agent
    if _conversational_agent is None:
        _conversational_agent = ConversationalCommandAgent()
    return _conversational_agent
