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

  return (
    <UserCursor
      name="Sarah / Dev"
      color="#3B82F6"
      className="rounded-[26px] border border-hairline/80 bg-surface-card p-2 shadow-[0_24px_70px_rgba(22,18,14,0.12)] transition-shadow duration-500 hover:shadow-[0_28px_80px_rgba(22,18,14,0.16)]"
    >
      <div className="relative flex h-[380px] w-full flex-col overflow-hidden rounded-[20px] bg-canvas text-left sm:h-[420px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.11),transparent_45%)]" />
        <div className="relative flex items-center justify-between border-b border-hairline/70 px-4 py-3 sm:px-5">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted">Your schedule</p>
            <h4 className="mt-0.5 text-sm font-semibold text-ink">August {selectedDay}<span className="font-normal text-muted">, 2026</span></h4>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/15 bg-blue-500/[0.07] px-2.5 py-1 text-[9px] font-semibold text-blue-700 dark:text-blue-300">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Google Calendar
          </div>
        </div>

        <div className="relative grid grid-cols-7 gap-1 px-4 py-3 sm:px-5">
          {["M", "T", "W", "T", "F", "S", "S"].map((dayName, index) => (
            <div key={`${dayName}-${index}`} className="flex flex-col items-center gap-1.5">
              <span className="text-[9px] font-semibold uppercase text-muted-soft">{dayName}</span>
              <button
                type="button"
                onClick={() => setSelectedDay([24, 25, 26, 27, 28, 29, 30][index])}
                aria-pressed={selectedDay === [24, 25, 26, 27, 28, 29, 30][index]}
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-[11px] font-semibold transition-all ${
                  selectedDay === [24, 25, 26, 27, 28, 29, 30][index]
                    ? "bg-ink text-canvas shadow-md shadow-ink/15"
                    : "text-ink hover:bg-canvas-soft"
                }`}
              >
                {[24, 25, 26, 27, 28, 29, 30][index]}
              </button>
            </div>
          ))}
        </div>

        <div className="relative flex items-center justify-between border-t border-hairline/60 px-4 pb-2 pt-3 sm:px-5">
          <span className="text-[10px] font-semibold text-ink">Today at a glance</span>
          <span className="text-[9px] text-muted">{events.filter((event) => !event.completed).length} items to go</span>
        </div>

        <div className="relative flex-1 space-y-2 overflow-y-auto px-4 pb-3 sm:px-5">
          {events.map((event) => (
            <motion.button
              key={event.id}
              type="button"
              aria-pressed={event.completed}
              whileTap={{ scale: 0.99 }}
              onClick={() => toggleEvent(event.id)}
              className={`group flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition-colors ${
                event.completed
                  ? "border-hairline/70 bg-canvas-soft/65"
                  : "border-hairline/80 bg-surface-card hover:border-blue-500/30 hover:bg-blue-500/[0.025]"
              }`}
            >
              <span className={`h-8 w-1 shrink-0 rounded-full ${event.completed ? "bg-muted-soft/40" : event.color === "success" ? "bg-emerald-500" : event.color === "warning" ? "bg-amber-500" : event.color === "danger" ? "bg-rose-500" : "bg-blue-500"}`} />
              <span className="w-[58px] shrink-0 text-[9px] font-semibold tabular-nums text-muted">{event.time}</span>
              <span className="min-w-0 flex-1">
                <span className={`block truncate text-[10px] font-semibold ${event.completed ? "text-muted line-through" : "text-ink"}`}>{event.title}</span>
                <span className="mt-0.5 block text-[9px] capitalize text-muted">{event.type}</span>
              </span>
              <span aria-hidden="true" className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] ${event.completed ? "border-blue-600 bg-blue-600 text-white" : "border-hairline text-transparent group-hover:border-blue-500/50"}`}>
                ✓
              </span>
            </motion.button>
          ))}
        </div>

        <div className="relative mx-3 mb-3 flex items-center gap-2 rounded-2xl border border-blue-500/15 bg-blue-500/[0.06] px-3 py-2.5 sm:mx-4 sm:mb-4">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-300">✦</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[9px] font-semibold text-ink">A little room to focus</span>
            <span className="block truncate text-[9px] text-muted">Suggested open block · 4:00–4:45 PM</span>
          </span>
          <span className="shrink-0 rounded-full bg-blue-500/10 px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">Synced</span>
        </div>
      </div>
    </UserCursor>
  );
}
