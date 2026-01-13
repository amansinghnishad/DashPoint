"""Calendar scheduling handler."""

from __future__ import annotations

import re
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional


class ScheduleHandlers:
    def schedule_calendar_block(
        self, parameters: List[str], user_context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Produce an API call for /api/calendar/google/schedule.

        This is intentionally conservative: it schedules within a nearby window
        (default: next 7 days) and relies on the server-side scheduler to find
        an actual free slot.
        """

        if not parameters:
            return {"success": False, "message": "No scheduling request provided"}

        raw = (parameters[0] or "").strip()
        if not raw:
            return {"success": False, "message": "No scheduling request provided"}

        duration_minutes = 60
        duration_match = re.search(
            r"(\d+)\s*(hours?|hrs?|hr|minutes?|mins?|min)\b", raw, re.IGNORECASE
        )
        if duration_match:
            qty = int(duration_match.group(1))
            unit = duration_match.group(2).lower()
            if unit.startswith("hour") or unit.startswith("hr"):
                duration_minutes = max(5, min(qty * 60, 8 * 60))
            else:
                duration_minutes = max(5, min(qty, 8 * 60))

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

            target_date = now_local.date()
            if "tomorrow" in lower:
                target_date = (now_local + timedelta(days=1)).date()
            elif "today" in lower:
                target_date = now_local.date()
            else:
                candidate_dt = datetime(
                    target_date.year, target_date.month, target_date.day, hh, mm, 0
                )
                if candidate_dt <= now_local:
                    target_date = (now_local + timedelta(days=1)).date()

            slot_start = datetime(target_date.year, target_date.month, target_date.day, hh, mm, 0)
            slot_end = slot_start + timedelta(minutes=duration_minutes)
            time_min = slot_start
            time_max = slot_end

        conflict_strategy = "auto"
        if "split" in lower:
            conflict_strategy = "split"
        elif "shorten" in lower or "shorter" in lower:
            conflict_strategy = "shorten"
        elif "next window" in lower or "next-window" in lower:
            conflict_strategy = "next-window"

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

        title = "Focus Block"
        quoted = re.search(r'\"([^\"]{1,200})\"', raw)
        if quoted:
            title = quoted.group(1)
        else:
            candidate = raw
            candidate = re.sub(
                r"^(schedule|book|plan|create|set up|practice|work on)\s+",
                "",
                candidate,
                flags=re.IGNORECASE,
            ).strip()
            candidate = re.sub(
                r"\b(\d+)\s*(hours?|hrs?|hr|minutes?|mins?|min)\b",
                "",
                candidate,
                flags=re.IGNORECASE,
            )
            candidate = re.sub(r"\b(today|tomorrow|tonight)\b", "", candidate, flags=re.IGNORECASE)
            candidate = re.sub(
                r"\bat\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?\b",
                "",
                candidate,
                flags=re.IGNORECASE,
            )
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
