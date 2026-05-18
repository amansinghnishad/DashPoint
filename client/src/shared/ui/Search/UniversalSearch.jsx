import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  CalendarDays,
  FileText,
  FolderOpen,
  Loader2,
  MessageSquare,
  PanelsTopLeft,
  Search,
  Youtube,
} from "@/shared/ui/icons/icons";

import { universalSearchAPI } from "../../../services/modules/universalSearchApi";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 250;

const TYPE_ICON = {
  collection: FolderOpen,
  file: FileText,
  planner_widget: PanelsTopLeft,
  youtube: Youtube,
  youtube_transcript: Youtube,
  calendar_event: CalendarDays,
  chat_message: MessageSquare,
};

const TYPE_LABEL = {
  collection: "Collection",
  file: "File",
  planner_widget: "Planner",
  youtube: "YouTube",
  youtube_transcript: "Transcript",
  calendar_event: "Calendar",
  chat_message: "Chat",
};

const flattenGroups = (groups = []) =>
  groups.flatMap((group) => (group.results || []).map((result) => ({ group, result })));

function ResultRow({ item, isActive, onSelect }) {
  const { result } = item;
  const Icon = TYPE_ICON[result.type] || Search;
  const label = TYPE_LABEL[result.type] || result.type;

  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => onSelect(result)}
      className={`w-full rounded-xl px-3 py-2 text-left transition-colors ${
        isActive ? "dp-sidebar-bg dp-text" : "dp-hover-bg dp-text-muted dp-hover-text"
      }`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="dp-surface dp-border mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border">
          <Icon size={17} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-semibold">{result.title}</span>
            <span className="dp-border shrink-0 rounded-md border px-1.5 py-0.5 text-[11px] font-medium dp-text-subtle">
              {label}
            </span>
          </span>
          {result.subtitle ? (
            <span className="mt-0.5 block truncate text-xs dp-text-subtle">{result.subtitle}</span>
          ) : null}
          {result.snippet ? (
            <span className="mt-1 block line-clamp-2 text-xs leading-5 dp-text-muted">
              {result.snippet}
            </span>
          ) : null}
        </span>
      </div>
    </button>
  );
}

const UniversalSearch = forwardRef(function UniversalSearch({ onResultSelect }, ref) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);

  const flatResults = useMemo(() => flattenGroups(payload?.groups), [payload]);
  const trimmedQuery = query.trim();

  const close = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(0);
  }, []);

  const handleSelect = useCallback(
    (result) => {
      if (!result) return;
      onResultSelect?.(result);
      close();
    },
    [close, onResultSelect],
  );

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!rootRef.current || rootRef.current.contains(event.target)) return;
      close();
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [close]);

  useEffect(() => {
    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      setPayload(null);
      setError("");
      setIsLoading(false);
      return undefined;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await universalSearchAPI.search(trimmedQuery, 6);
        if (cancelled) return;
        setPayload(response?.data || null);
        setActiveIndex(0);
      } catch (err) {
        if (cancelled) return;
        setPayload(null);
        setError(err?.response?.data?.message || err?.message || "Search failed");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [trimmedQuery]);

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      close();
      return;
    }

    if (!flatResults.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(flatResults.length - 1, current + 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(0, current - 1));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      handleSelect(flatResults[activeIndex]?.result);
    }
  };

  return (
    <div ref={rootRef} className="relative w-full max-w-xl">
      <div className="dp-surface dp-border flex h-11 items-center gap-3 rounded-2xl border px-3">
        <Search size={17} className="dp-text-muted shrink-0" />
        <input
          ref={ref}
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search everything..."
          aria-label="Universal search"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none dp-text placeholder:opacity-60"
        />
        <kbd className="dp-border hidden shrink-0 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold dp-text-subtle sm:inline">
          Ctrl K
        </kbd>
      </div>

      {isOpen ? (
        <div className="dp-surface dp-border absolute right-0 top-12 z-[70] w-[min(42rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border shadow-2xl">
          {trimmedQuery.length < MIN_QUERY_LENGTH ? (
            <div className="p-4">
              <p className="dp-text text-sm font-semibold">Search DashPoint</p>
              <p className="dp-text-muted mt-1 text-sm">
                Files, collections, transcripts, calendar, planner, and chat.
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center gap-3 p-4 dp-text-muted">
              <Loader2 size={17} className="animate-spin" />
              <span className="text-sm">Searching...</span>
            </div>
          ) : error ? (
            <div className="p-4">
              <p className="dp-text text-sm font-semibold">Search failed</p>
              <p className="dp-text-muted mt-1 text-sm">{error}</p>
            </div>
          ) : flatResults.length ? (
            <div className="max-h-[70vh] overflow-y-auto p-2">
              {(payload?.groups || []).map((group) => (
                <section key={group.type} className="py-1">
                  <div className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide dp-text-subtle">
                    {group.label}
                  </div>
                  <div className="space-y-1">
                    {(group.results || []).map((result) => {
                      const index = flatResults.findIndex((item) => item.result.id === result.id);
                      return (
                        <ResultRow
                          key={`${result.type}-${result.id}`}
                          item={{ group, result }}
                          isActive={index === activeIndex}
                          onSelect={handleSelect}
                        />
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="p-4">
              <p className="dp-text text-sm font-semibold">No results</p>
              <p className="dp-text-muted mt-1 text-sm">Try a file, topic, video, or event name.</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
});

export default UniversalSearch;
