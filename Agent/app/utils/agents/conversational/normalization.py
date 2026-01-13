"""Normalization and small resolution helpers."""

from __future__ import annotations

import re
from typing import Any, Dict, Optional


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


def normalize_input(user_input: str) -> str:
    normalized = (user_input or "").lower().strip()
    normalized = re.sub(r"\s+", " ", normalized)
    for contraction, expansion in _CONTRACTIONS.items():
        normalized = normalized.replace(contraction, expansion)
    return normalized


def normalize_widget_type(raw: str) -> Optional[str]:
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


def resolve_collection_id(
    user_context: Optional[Dict[str, Any]],
    collection_hint: Optional[str],
) -> Optional[str]:
    if not isinstance(user_context, dict):
        return None

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

    for c in collections:
        if not isinstance(c, dict):
            continue
        name = str(c.get("name") or "").strip().lower()
        cid = str(c.get("id") or "").strip()
        if name and cid and name == hint:
            return cid

    for c in collections:
        if not isinstance(c, dict):
            continue
        name = str(c.get("name") or "").strip().lower()
        cid = str(c.get("id") or "").strip()
        if name and cid and hint in name:
            return cid

    return None
