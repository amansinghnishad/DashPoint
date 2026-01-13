"""Small datatypes used by the conversational agent."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any, Callable, Dict, Iterable, List, Optional, Pattern

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
