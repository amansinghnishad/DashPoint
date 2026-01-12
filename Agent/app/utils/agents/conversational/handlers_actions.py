"""Handlers for state-changing DashPoint actions."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from .normalization import normalize_widget_type, resolve_collection_id


class ActionHandlers:
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

        widget_type = normalize_widget_type(raw_widget)
        if not widget_type:
            return {
                "success": False,
                "message": (
                    "Unknown widget type. Supported: top-priorities, todo-list, appointments, "
                    "daily-schedule, goals, notes, notes-tomorrow."
                ),
            }

        collection_id = resolve_collection_id(user_context, collection_hint)
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
