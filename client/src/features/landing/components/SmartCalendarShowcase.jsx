import { motion } from "framer-motion";
import { useState } from "react";

import UserCursor from "../../../shared/ui/Cursor/UserCursor";

const INITIAL_EVENTS = [
  { id: "e1", title: "Architecture & RAG Sync", time: "09:30 AM", type: "task", color: "info", completed: false },
  { id: "e2", title: "Product Sprint Review", time: "11:00 AM", type: "event", color: "success", completed: true },
  { id: "e3", title: "AI Scheduling Optimizer", time: "02:15 PM", type: "todo", color: "warning", completed: false },
  { id: "e4", title: "Deep Work Focus Block", time: "04:00 PM", type: "task", color: "danger", completed: false },
];

export default function SmartCalendarShowcase() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [selectedDay, setSelectedDay] = useState(25);

  const toggleEvent = (id) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e)),
    );
  };

  const getChipBadge = (color) => {
    switch (color) {
      case "success":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "warning":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "danger":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default:
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    }
  };

  return (
    <UserCursor
      name="Sarah / Dev"
      color="#3B82F6"
      className="p-3 sm:p-5 bg-surface-card/90 border border-hairline/80 backdrop-blur-xl shadow-2xl rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-500 hover:border-blue-500/30"
    >
      <div className="flex flex-col h-[380px] sm:h-[420px] w-full text-left">
        {/* Calendar Header */}
        <div className="flex items-center justify-between pb-3 border-b border-hairline/60 select-none">
          <div>
            <h4 className="text-xs font-bold text-ink">Smart Adaptive Calendar</h4>
            <p className="text-[10px] text-muted">Conflict Resolution & Google Sync</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-ink">August 2026</span>
            <div className="flex items-center gap-1 bg-canvas-soft border border-hairline px-2 py-0.5 rounded-lg text-[10px] font-semibold text-muted">
              Active
            </div>
          </div>
        </div>

        {/* Mini Calendar Strip */}
        <div className="grid grid-cols-7 gap-1 py-3 text-center border-b border-hairline/40 select-none">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <span key={i} className="text-[9px] font-bold text-muted uppercase">
              {d}
            </span>
          ))}
          {[24, 25, 26, 27, 28, 29, 30].map((day) => {
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`py-1 rounded-lg text-xs font-semibold transition-colors ${
                  isSelected
                    ? "bg-ink text-canvas shadow-sm"
                    : "hover:bg-canvas-soft text-ink"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Dynamic Schedule Stream */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2 text-xs">
          <div className="flex items-center justify-between select-none mb-1">
            <span className="text-[11px] font-bold text-ink">Scheduled Timetable</span>
            <span className="text-[10px] text-muted font-medium">Click chip to toggle</span>
          </div>

          {events.map((ev) => (
            <motion.div
              key={ev.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleEvent(ev.id)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                ev.completed
                  ? "bg-canvas-soft/60 border-hairline opacity-60 line-through"
                  : "bg-surface-card border-hairline/80 shadow-sm hover:border-blue-500/40"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={ev.completed}
                  onChange={() => toggleEvent(ev.id)}
                  className="rounded border-hairline text-ink focus:ring-0"
                />
                <div>
                  <p className="font-semibold text-xs text-ink">{ev.title}</p>
                  <p className="text-[10px] text-muted">{ev.time}</p>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase ${getChipBadge(
                  ev.color,
                )}`}
              >
                {ev.type}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Instant AI Auto-Scheduler Insight */}
        <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
              Optimal focus block auto-detected at 4:00 PM
            </span>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-blue-500">
            Synced
          </span>
        </div>
      </div>
    </UserCursor>
  );
}
