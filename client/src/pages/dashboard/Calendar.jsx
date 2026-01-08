export default function CalendarPage() {
  // Google Calendar-inspired month view (simple MVP)
  // - Left: mini month picker + connect status
  // - Right: month grid with events rendered on dates
  return <CalendarMonthView />;
}

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { calendarAPI } from "../../services/api";
import { useCalendar } from "../../hooks/useCalendar";
import Modal from "../../components/Modals/Modal";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const startOfDay = (d) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
const endOfDay = (d) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

const isSameDay = (a, b) =>
  a && b
    ? a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    : false;

const formatMonthLabel = (d) =>
  d.toLocaleDateString(undefined, { month: "long", year: "numeric" });

const pad2 = (n) => String(n).padStart(2, "0");
const dayKey = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const parseEventStartDate = (value) => {
  if (!value) return null;
  const v = String(value);
  // All-day events often come as YYYY-MM-DD (no timezone). Parse as local date.
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const [y, m, d] = v.split("-").map((x) => parseInt(x, 10));
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }
  const dt = new Date(v);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

function buildMonthGrid(month) {
  const first = startOfMonth(month);
  const last = endOfMonth(month);
  const startWeekday = first.getDay();
  const totalDays = last.getDate();

  const result = [];
  // Leading days from previous month
  for (let i = 0; i < startWeekday; i += 1) {
    const prev = new Date(first);
    prev.setDate(first.getDate() - (startWeekday - i));
    result.push(prev);
  }
  // Current month days
  for (let d = 1; d <= totalDays; d += 1) {
    result.push(new Date(month.getFullYear(), month.getMonth(), d));
  }
  // Trailing days (fill to 6 weeks)
  while (result.length % 7 !== 0) {
    const next = new Date(last);
    next.setDate(
      last.getDate() + (result.length - (startWeekday + totalDays) + 1)
    );
    result.push(next);
  }
  // Ensure 6 rows (42 cells) like Google Calendar month view
  while (result.length < 42) {
    const lastCell = result[result.length - 1];
    const next = new Date(lastCell);
    next.setDate(lastCell.getDate() + 1);
    result.push(next);
  }

  return result;
}

function CalendarMonthView() {
  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [monthEvents, setMonthEvents] = useState([]);
  const [monthLoading, setMonthLoading] = useState(false);
  const [monthError, setMonthError] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createType, setCreateType] = useState("event");
  const [createTitle, setCreateTitle] = useState("");
  const [createDate, setCreateDate] = useState(() => dayKey(new Date()));
  const [createStartTime, setCreateStartTime] = useState("09:00");
  const [createEndTime, setCreateEndTime] = useState("10:00");
  const [createColor, setCreateColor] = useState("info");
  const [creating, setCreating] = useState(false);

  const {
    selectedDate,
    setSelectedDate,
    connected,
    loadingStatus,
    error: connectError,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
    refreshStatus,
  } = useCalendar();

  // Keep selected date within the visible month when navigating.
  useEffect(() => {
    const inSameMonth =
      selectedDate.getFullYear() === month.getFullYear() &&
      selectedDate.getMonth() === month.getMonth();
    if (!inSameMonth) {
      setSelectedDate(new Date(month.getFullYear(), month.getMonth(), 1));
    }
  }, [month, selectedDate, setSelectedDate]);

  const monthRange = useMemo(() => {
    const min = startOfDay(startOfMonth(month));
    const max = endOfDay(endOfMonth(month));
    return { timeMin: min.toISOString(), timeMax: max.toISOString() };
  }, [month]);

  const loadMonthEvents = useCallback(async () => {
    if (!connected) {
      setMonthEvents([]);
      return;
    }

    setMonthLoading(true);
    setMonthError(null);
    try {
      const res = await calendarAPI.listGoogleEvents(monthRange);
      const list = res?.data?.events || [];
      setMonthEvents(Array.isArray(list) ? list : []);
    } catch (e) {
      setMonthEvents([]);
      setMonthError(e);
    } finally {
      setMonthLoading(false);
    }
  }, [connected, monthRange]);

  useEffect(() => {
    setCreateDate(dayKey(selectedDate));
  }, [selectedDate]);

  const openCreate = () => {
    setCreateTitle("");
    setCreateType("event");
    setCreateDate(dayKey(selectedDate));
    setCreateStartTime("09:00");
    setCreateEndTime("10:00");
    setCreateColor("info");
    setCreateOpen(true);
  };

  const onCreateSubmit = async () => {
    if (!connected) {
      setMonthError(new Error("Connect Google Calendar first."));
      return;
    }

    const title = createTitle.trim();
    if (!title) {
      setMonthError(new Error("Title is required."));
      return;
    }

    // Build Google Calendar event payload
    const payload = {
      summary: title,
      dashpointType: createType,
      dashpointColor: createColor,
    };

    // Optional: best-effort Google Calendar color mapping (1-11)
    // We keep this simple and stable; DashPoint styling is driven by dashpointColor.
    const colorIdMap = {
      info: "9",
      success: "10",
      warning: "6",
      danger: "11",
    };
    payload.colorId = colorIdMap[createColor] || undefined;

    const date = String(createDate);
    const isTodoOrTask = createType === "todo" || createType === "task";

    // Tasks/todos default to all-day entries.
    if (isTodoOrTask) {
      payload.start = { date };
      payload.end = { date };
    } else {
      // Timed event
      const startIso = new Date(`${date}T${createStartTime}:00`).toISOString();
      const endIso = new Date(`${date}T${createEndTime}:00`).toISOString();
      payload.start = { dateTime: startIso };
      payload.end = { dateTime: endIso };
    }

    setCreating(true);
    setMonthError(null);
    try {
      const res = await calendarAPI.createGoogleEvent(payload);
      if (!res?.success) throw new Error(res?.message || "Failed to create");
      setCreateOpen(false);
      await loadMonthEvents();
    } catch (e) {
      setMonthError(e);
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    loadMonthEvents();
  }, [loadMonthEvents]);

  const eventsByDay = useMemo(() => {
    const map = new Map();
    for (const ev of monthEvents) {
      const d = parseEventStartDate(ev?.start);
      if (!d) continue;
      const key = dayKey(d);
      const prev = map.get(key) || [];
      prev.push(ev);
      map.set(key, prev);
    }
    // Sort events per day by start time (best-effort)
    for (const [key, arr] of map.entries()) {
      arr.sort((a, b) => {
        const ad = parseEventStartDate(a?.start);
        const bd = parseEventStartDate(b?.start);
        return (ad?.getTime?.() || 0) - (bd?.getTime?.() || 0);
      });
      map.set(key, arr);
    }
    return map;
  }, [monthEvents]);

  const miniGrid = useMemo(() => buildMonthGrid(month), [month]);
  const mainGrid = miniGrid;

  const headerRight = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setMonth(startOfMonth(new Date()))}
        className="dp-btn-secondary rounded-xl px-3 py-2 text-xs font-semibold"
      >
        Today
      </button>

      <button
        type="button"
        onClick={() =>
          setMonth((prev) =>
            startOfMonth(new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
          )
        }
        className="dp-btn-icon inline-flex h-9 w-9 items-center justify-center rounded-xl"
        aria-label="Previous month"
      >
        <ChevronLeft size={18} />
      </button>

      <button
        type="button"
        onClick={() =>
          setMonth((prev) =>
            startOfMonth(new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
          )
        }
        className="dp-btn-icon inline-flex h-9 w-9 items-center justify-center rounded-xl"
        aria-label="Next month"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );

  return (
    <section className="rounded-3xl border dp-border dp-surface p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="dp-text text-xl font-semibold truncate">Calendar</h1>
          <p className="dp-text-muted mt-1 text-sm truncate">
            {formatMonthLabel(month)}
          </p>
        </div>
        {headerRight}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Left panel */}
        <aside className="dp-surface dp-border rounded-2xl border p-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={openCreate}
              className="dp-btn-primary rounded-xl px-4 py-2 text-sm font-semibold"
            >
              Create
            </button>
            <div className="flex items-center gap-2">
              {connected ? (
                <button
                  type="button"
                  onClick={disconnectGoogleCalendar}
                  className="dp-btn-secondary rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  type="button"
                  onClick={connectGoogleCalendar}
                  className="dp-btn-primary rounded-xl px-3 py-2 text-xs font-semibold"
                  disabled={loadingStatus}
                >
                  Connect
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="dp-text text-sm font-semibold truncate">
                Google Calendar
              </p>
              <p className="dp-text-muted text-xs truncate">
                {loadingStatus
                  ? "Checking connection…"
                  : connected
                  ? "Connected"
                  : "Not connected"}
              </p>
              {connectError ? (
                <p className="mt-1 text-xs text-red-200 truncate">
                  {connectError?.response?.data?.message ||
                    connectError?.message ||
                    "Error"}
                </p>
              ) : null}
              {monthError ? (
                <p className="mt-1 text-xs text-red-200 truncate">
                  {monthError?.response?.data?.message ||
                    monthError?.message ||
                    "Error"}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() =>
                setMonth((prev) =>
                  startOfMonth(
                    new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                  )
                )
              }
              className="dp-btn-icon inline-flex h-9 w-9 items-center justify-center rounded-xl"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>

            <p className="dp-text text-sm font-semibold truncate">
              {formatMonthLabel(month)}
            </p>

            <button
              type="button"
              onClick={() =>
                setMonth((prev) =>
                  startOfMonth(
                    new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                  )
                )
              }
              className="dp-btn-icon inline-flex h-9 w-9 items-center justify-center rounded-xl"
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((w) => (
              <div
                key={w}
                className="dp-text-muted text-center text-[11px] font-semibold"
              >
                {w.slice(0, 1)}
              </div>
            ))}

            {miniGrid.map((d) => {
              const inMonth = d.getMonth() === month.getMonth();
              const isSelected = isSameDay(d, selectedDate);
              const isToday = isSameDay(d, today);

              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => setSelectedDate(d)}
                  className={
                    "h-8 w-full rounded-lg text-xs font-semibold transition-colors " +
                    (isSelected
                      ? "dp-surface-muted dp-border border"
                      : "dp-hover-bg") +
                    (inMonth ? " dp-text" : " dp-text-muted") +
                    (isToday ? " ring-1 ring-inset" : "")
                  }
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                refreshStatus();
                loadMonthEvents();
              }}
              className="dp-btn-secondary rounded-xl px-3 py-2 text-xs font-semibold"
            >
              Refresh
            </button>
            <p className="dp-text-muted text-xs">
              {monthLoading ? "Loading…" : connected ? "Synced" : ""}
            </p>
          </div>
        </aside>

        {/* Main month grid */}
        <div className="dp-surface dp-border rounded-2xl border overflow-hidden">
          <div className="grid grid-cols-7 border-b dp-border">
            {WEEKDAYS.map((w) => (
              <div
                key={w}
                className="px-3 py-2 dp-text-muted text-xs font-semibold"
              >
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {mainGrid.map((d) => {
              const inMonth = d.getMonth() === month.getMonth();
              const isTodayCell = isSameDay(d, today);
              const isSelected = isSameDay(d, selectedDate);
              const list = eventsByDay.get(dayKey(d)) || [];
              const chipClassFor = (t) => {
                if (t === "todo") return "dp-cal-chip dp-cal-chip-todo";
                if (t === "task") return "dp-cal-chip dp-cal-chip-task";
                return "dp-cal-chip dp-cal-chip-event";
              };

              const chipClassForColor = (c) => {
                if (c === "success") return "dp-cal-chip dp-cal-chip-success";
                if (c === "warning") return "dp-cal-chip dp-cal-chip-warning";
                if (c === "danger") return "dp-cal-chip dp-cal-chip-danger";
                if (c === "info") return "dp-cal-chip dp-cal-chip-info";
                return null;
              };

              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => setSelectedDate(d)}
                  className={
                    "min-h-[92px] border-b border-r dp-border p-2 text-left transition-colors " +
                    (isSelected ? "dp-surface-muted" : "dp-hover-bg")
                  }
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={
                        "inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-lg text-xs font-semibold " +
                        (inMonth ? "dp-text" : "dp-text-muted") +
                        (isTodayCell ? " ring-1 ring-inset" : "")
                      }
                      aria-label={d.toDateString()}
                    >
                      {d.getDate()}
                    </div>
                  </div>

                  <div className="mt-2 space-y-1">
                    {list.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        className={
                          "dp-surface dp-border rounded-lg border px-2 py-1 " +
                          (chipClassForColor(ev?.dashpointColor) ||
                            chipClassFor(ev?.dashpointType))
                        }
                        title={ev.summary}
                      >
                        <p className="dp-text text-xs font-semibold truncate">
                          {ev.summary}
                        </p>
                      </div>
                    ))}
                    {list.length > 3 ? (
                      <p className="dp-text-muted text-xs">
                        +{list.length - 3} more
                      </p>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create"
        description="Add an event, task, or to-do and sync to Google Calendar."
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold"
              disabled={creating}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onCreateSubmit}
              className="dp-btn-primary rounded-xl px-4 py-2 text-sm font-semibold"
              disabled={creating}
            >
              {creating ? "Creating…" : "Create"}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="dp-text text-sm font-semibold">Type</label>
            <select
              value={createType}
              onChange={(e) => setCreateType(e.target.value)}
              className="mt-2 dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
            >
              <option value="event">Event</option>
              <option value="task">Task</option>
              <option value="todo">To-do</option>
            </select>
          </div>

          <div>
            <label className="dp-text text-sm font-semibold">Title</label>
            <input
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              className="mt-2 dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
              placeholder="What is it?"
            />
          </div>

          <div>
            <label className="dp-text text-sm font-semibold">Color</label>
            <select
              value={createColor}
              onChange={(e) => {
                const v = e.target.value;
                setCreateColor(v);
              }}
              className="mt-2 dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
            >
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="danger">Danger</option>
            </select>
          </div>

          <div>
            <label className="dp-text text-sm font-semibold">Date</label>
            <input
              type="date"
              value={createDate}
              onChange={(e) => setCreateDate(e.target.value)}
              className="mt-2 dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
            />
          </div>

          {createType === "event" ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="dp-text text-sm font-semibold">Start</label>
                <input
                  type="time"
                  value={createStartTime}
                  onChange={(e) => setCreateStartTime(e.target.value)}
                  className="mt-2 dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
                />
              </div>
              <div>
                <label className="dp-text text-sm font-semibold">End</label>
                <input
                  type="time"
                  value={createEndTime}
                  onChange={(e) => setCreateEndTime(e.target.value)}
                  className="mt-2 dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
                />
              </div>
            </div>
          ) : (
            <p className="dp-text-muted text-sm">
              Tasks and to-dos are created as all-day items.
            </p>
          )}
        </div>
      </Modal>
    </section>
  );
}
