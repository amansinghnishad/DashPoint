import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ArrowRight,
  CalendarDays,
  CheckSquare,
  Clock,
  Crosshair,
  FileText,
  Loader2,
  RotateCcw,
  Sparkles,
  Youtube,
} from "@/shared/ui/icons/icons";

import { focusAPI } from "../../../services/modules/focusApi";

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const formatDateLabel = (value) => {
  if (!value) return "Today";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Today";
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date);
};

const formatRelative = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.max(1, Math.round(diffMs / (60 * 60 * 1000)));
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
};

function StatTile({ icon: Icon, label, value }) {
  return (
    <div className="dp-surface dp-border rounded-2xl border p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="dp-text-muted text-sm font-medium">{label}</span>
        <span className="dp-border inline-flex h-9 w-9 items-center justify-center rounded-xl border dp-text">
          <Icon size={17} />
        </span>
      </div>
      <div className="dp-text mt-3 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Panel({ title, icon: Icon, action, children }) {
  return (
    <section className="dp-surface dp-border rounded-2xl border p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Icon size={18} className="dp-text-muted shrink-0" />
          <h2 className="dp-text truncate text-sm font-semibold">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ text }) {
  return (
    <div className="dp-border rounded-xl border px-4 py-6 text-center">
      <p className="dp-text-muted text-sm">{text}</p>
    </div>
  );
}

function EventList({ events, onCalendarOpen }) {
  if (!events.length) {
    return <EmptyState text="No calendar events today." />;
  }

  return (
    <div className="space-y-2">
      {events.slice(0, 6).map((event) => (
        <button
          key={event.id}
          type="button"
          onClick={onCalendarOpen}
          className="dp-hover-bg w-full rounded-xl px-3 py-2 text-left transition-colors"
        >
          <div className="flex items-start gap-3">
            <span className="dp-border mt-0.5 inline-flex min-w-16 justify-center rounded-lg border px-2 py-1 text-xs font-semibold dp-text">
              {event.allDay ? "All day" : formatTime(event.start)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="dp-text block truncate text-sm font-semibold">{event.summary}</span>
              {event.location || event.description ? (
                <span className="dp-text-muted mt-0.5 block truncate text-xs">
                  {event.location || event.description}
                </span>
              ) : null}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

function TaskList({ tasks, onOpenCollection }) {
  if (!tasks.length) {
    return <EmptyState text="No pending tasks." />;
  }

  return (
    <div className="space-y-2">
      {tasks.slice(0, 8).map((task) => (
        <button
          key={task.id}
          type="button"
          onClick={() => task.collectionId && onOpenCollection?.(task.collectionId)}
          className="dp-hover-bg w-full rounded-xl px-3 py-2 text-left transition-colors"
        >
          <span className="dp-text block text-sm font-semibold">{task.text}</span>
          <span className="dp-text-muted mt-0.5 block truncate text-xs">
            {task.collectionName || task.widgetTitle}
          </span>
        </button>
      ))}
    </div>
  );
}

function PriorityList({ priorities, onPrioritySelect }) {
  if (!priorities.length) {
    return <EmptyState text="No priorities yet." />;
  }

  return (
    <div className="space-y-2">
      {priorities.map((priority, index) => (
        <button
          key={priority.id}
          type="button"
          onClick={() => onPrioritySelect?.(priority)}
          className="dp-hover-bg w-full rounded-xl px-3 py-2 text-left transition-colors"
        >
          <div className="flex items-start gap-3">
            <span className="dp-btn-hero inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="dp-text block text-sm font-semibold">{priority.title}</span>
              <span className="dp-text-muted mt-0.5 block text-xs">{priority.reason}</span>
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

function RecentList({ files, videos, onNavigate }) {
  const items = [
    ...files.map((item) => ({ ...item, kind: "file", icon: FileText })),
    ...videos.map((item) => ({ ...item, kind: "youtube", icon: Youtube })),
  ]
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
    .slice(0, 8);

  if (!items.length) {
    return <EmptyState text="No recent files or videos." />;
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={`${item.kind}-${item.id}`}
            type="button"
            onClick={() => onNavigate?.(item.kind === "file" ? "files" : "youtube")}
            className="dp-hover-bg w-full rounded-xl px-3 py-2 text-left transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="dp-border inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border dp-text-muted">
                <Icon size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="dp-text block truncate text-sm font-semibold">{item.title}</span>
                <span className="dp-text-muted mt-0.5 block truncate text-xs">
                  {[item.subtitle, formatRelative(item.updatedAt)].filter(Boolean).join(" · ")}
                </span>
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default function FocusPage({ onNavigate, onOpenCollection }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await focusAPI.getSummary();
      setSummary(response?.data || null);
    } catch (err) {
      setSummary(null);
      setError(err?.response?.data?.message || err?.message || "Unable to load focus data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const stats = useMemo(() => {
    const events = summary?.calendar?.events || [];
    const tasks = summary?.pendingTasks || [];
    const actionItems = summary?.unfinishedActionItems || [];
    const recent = (summary?.recent?.files?.length || 0) + (summary?.recent?.videos?.length || 0);

    return { events: events.length, tasks: tasks.length, actionItems: actionItems.length, recent };
  }, [summary]);

  const onPrioritySelect = (priority) => {
    if (priority?.type === "calendar_event") {
      onNavigate?.("calendar");
      return;
    }

    const collectionId = priority?.metadata?.collectionId;
    if (collectionId) {
      onOpenCollection?.(collectionId);
      return;
    }

    if (priority?.type === "youtube") {
      onNavigate?.("youtube");
    }
  };

  if (loading) {
    return (
      <section className="dp-surface dp-border rounded-3xl border p-6">
        <div className="flex items-center gap-3 dp-text-muted">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading focus...</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="dp-surface dp-border rounded-3xl border p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="dp-text text-xl font-semibold">Focus</h1>
            <p className="dp-text-muted mt-1 text-sm">{error}</p>
          </div>
          <button
            type="button"
            onClick={loadSummary}
            className="dp-btn-secondary inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold"
          >
            <RotateCcw size={16} />
            Retry
          </button>
        </div>
      </section>
    );
  }

  const events = summary?.calendar?.events || [];
  const pendingTasks = summary?.pendingTasks || [];
  const actionItems = summary?.unfinishedActionItems || [];
  const recentFiles = summary?.recent?.files || [];
  const recentVideos = summary?.recent?.videos || [];
  const priorities = summary?.priorities || [];
  const dateLabel = formatDateLabel(summary?.today?.date);

  return (
    <section className="space-y-5">
      <div className="dp-surface dp-border rounded-3xl border p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Crosshair size={20} className="dp-text-muted" />
              <h1 className="dp-text text-xl font-semibold">Focus</h1>
            </div>
            <p className="dp-text-muted mt-1 text-sm">
              {dateLabel} · {summary?.today?.timeZone || "UTC"}
            </p>
          </div>

          <button
            type="button"
            onClick={loadSummary}
            className="dp-btn-secondary inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold"
          >
            <RotateCcw size={16} />
            Refresh
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile icon={CalendarDays} label="Events" value={stats.events} />
          <StatTile icon={CheckSquare} label="Tasks" value={stats.tasks} />
          <StatTile icon={Sparkles} label="Action items" value={stats.actionItems} />
          <StatTile icon={Clock} label="Recent" value={stats.recent} />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <Panel title="Priorities" icon={Sparkles}>
          <PriorityList priorities={priorities} onPrioritySelect={onPrioritySelect} />
        </Panel>

        <Panel
          title="Today"
          icon={CalendarDays}
          action={
            <button
              type="button"
              onClick={() => onNavigate?.("calendar")}
              className="dp-btn-icon inline-flex h-8 w-8 items-center justify-center rounded-lg"
              aria-label="Open calendar"
              title="Open calendar"
            >
              <ArrowRight size={16} />
            </button>
          }
        >
          <EventList events={events} onCalendarOpen={() => onNavigate?.("calendar")} />
          {summary?.calendar?.warning ? (
            <p className="dp-text-muted mt-3 text-xs">{summary.calendar.warning}</p>
          ) : null}
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title="Pending Tasks" icon={CheckSquare}>
          <TaskList tasks={pendingTasks} onOpenCollection={onOpenCollection} />
        </Panel>

        <Panel title="Unfinished Action Items" icon={Sparkles}>
          <TaskList tasks={actionItems} onOpenCollection={onOpenCollection} />
        </Panel>

        <Panel title="Recent Files & Videos" icon={Clock}>
          <RecentList files={recentFiles} videos={recentVideos} onNavigate={onNavigate} />
        </Panel>
      </div>
    </section>
  );
}
