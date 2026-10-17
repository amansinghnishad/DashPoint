import { memo, useState } from "react";
import { CalendarDays, Check, ExternalLink, LoaderCircle, NotebookPen, Plus, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function MarkdownBubble({ content, isStreaming = false, className = "text-ink" }) {
  if (isStreaming) {
    return (
      <div className={`whitespace-pre-wrap text-sm leading-relaxed break-words ${className}`}>
        {content}
      </div>
    );
  }

  return (
    <div className={`dp-markdown text-sm leading-relaxed ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

function PendingBubble() {
  return (
    <div className="flex items-center gap-2 py-1 text-muted" role="status" aria-live="polite">
      <LoaderCircle size={15} className="animate-spin text-primary" aria-hidden="true" />
      <span className="text-xs font-medium">Thinking…</span>
    </div>
  );
}

const SOURCE_TYPE_LABELS = {
  collection: "Collection",
  file: "File",
  planner_note: "Note or task",
  youtube: "YouTube video",
  youtube_transcript: "Transcript",
  calendar_event: "Calendar event",
};

function getSafeSourceUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch {
    return "";
  }
}

function SourceList({ sources = [] }) {
  if (!sources.length) return null;

  return (
    <details className="mt-4 border-t border-hairline/70 pt-3">
      <summary className="cursor-pointer text-xs font-medium text-muted transition hover:text-ink">
        Sources used ({sources.length})
      </summary>
      <ul className="mt-2 grid gap-1.5">
        {sources.map((source, index) => {
          const citation = source.contextId || `C${index + 1}`;
          const label = source.sourceLabel || SOURCE_TYPE_LABELS[source.sourceType] || "Workspace source";
          const url = getSafeSourceUrl(source.url);
          const title = `${citation} · ${label}`;
          return (
            <li key={`${source.sourceType}-${source.sourceId || citation}`}>
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex max-w-full items-center gap-1.5 text-xs text-muted transition hover:text-primary"
                >
                  <span className="shrink-0 rounded-md bg-canvas-soft px-1.5 py-0.5 font-mono">[{citation}]</span>
                  <span className="truncate">{label}</span>
                  <ExternalLink size={12} className="shrink-0" aria-hidden="true" />
                </a>
              ) : (
                <span className="inline-flex max-w-full items-center gap-1.5 text-xs text-muted" title={title}>
                  <span className="shrink-0 rounded-md bg-canvas-soft px-1.5 py-0.5 font-mono">[{citation}]</span>
                  <span className="truncate">{label}</span>
                  <span className="shrink-0 text-muted-soft">{SOURCE_TYPE_LABELS[source.sourceType] || "Workspace source"}</span>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </details>
  );
}

function ChatActionDraft({ action, collections = [], onApprove, onDismiss }) {
  const [collectionId, setCollectionId] = useState(action.payload?.collectionId || "");
  const isSaving = action.status === "saving";
  const isDismissing = action.status === "dismissing";
  const isBusy = isSaving || isDismissing;
  const isSaved = action.status === "saved";
  const isDismissed = action.status === "dismissed";
  const typeLabel = action.type === "calendar_event" ? "Calendar event" : action.type === "task" ? "Task" : "Note";
  const Icon = action.type === "calendar_event" ? CalendarDays : action.type === "task" ? Check : NotebookPen;
  const payload = action.payload || {};
  const dateLabel = payload.startDateTime || payload.date || "";

  return (
    <section className="mt-4 rounded-xl border border-primary/25 bg-primary/5 p-3.5">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon size={16} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-ink">{isSaved ? `${typeLabel} saved` : isDismissed ? `${typeLabel} draft dismissed` : `Review ${typeLabel.toLowerCase()}`}</p>
          <p className="mt-1 break-words text-sm font-medium text-ink">
            {payload.summary || payload.title || (action.type === "task" ? payload.task : payload.note)}
          </p>
          {action.type === "task" || action.type === "note" ? (
            <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-relaxed text-muted">
              {action.type === "task" ? payload.task : payload.note}
            </p>
          ) : null}
          {dateLabel ? <p className="mt-1 text-xs text-muted">{dateLabel}</p> : null}
          {!isSaved && !isDismissed && action.type !== "calendar_event" && collections.length > 0 ? (
            <label className="mt-3 grid max-w-sm gap-1 text-xs text-muted">
              Save in collection
              <select
                value={collectionId}
                onChange={(event) => setCollectionId(event.target.value)}
                disabled={isBusy || Boolean(action.payload?.collectionId)}
                className="min-h-9 rounded-lg border border-hairline bg-surface-card px-2.5 text-xs text-ink outline-none focus:border-primary"
              >
                <option value="">No collection</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>{collection.name}</option>
                ))}
              </select>
            </label>
          ) : null}
          {action.error ? <p className="mt-2 text-xs text-semantic-error">{action.error}</p> : null}
          {!isSaved && !isDismissed ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onApprove?.(action.id, collectionId)}
                disabled={isBusy}
                className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-canvas transition hover:opacity-85 disabled:cursor-wait disabled:opacity-60"
              >
                {isBusy ? <LoaderCircle size={13} className="animate-spin" /> : <Plus size={13} />}
                {isSaving ? "Saving…" : isDismissing ? "Dismissing…" : action.type === "calendar_event" ? "Add event" : `Save ${action.type}`}
              </button>
              <button
                type="button"
                onClick={() => onDismiss?.(action.id)}
                disabled={isBusy}
                className="inline-flex min-h-8 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted transition hover:bg-canvas-soft hover:text-ink disabled:opacity-50"
              >
                <X size={13} /> Dismiss
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ChatMessageBubble({ entry, collections, onApproveAction, onDismissAction }) {
  const isUser = entry.role === "user";
  const isError = entry.role === "error";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      {isUser ? (
        <div className="dp-chat-bubble-user max-w-[min(82%,48rem)] rounded-2xl rounded-br-md px-4 py-3 shadow-sm sm:px-5">
          <MarkdownBubble
            content={entry.content}
            className="text-[color:var(--dp-chat-bubble-user-fg)]"
          />
        </div>
      ) : isError ? (
        <div className="dp-chat-bubble-error max-w-3xl rounded-2xl border border-semantic-error/20 px-4 py-3 sm:px-5">
          <MarkdownBubble
            content={entry.content}
            className="text-[color:var(--dp-chat-bubble-error-fg)]"
          />
        </div>
      ) : (
        <article className="dp-chat-bubble-assistant w-full max-w-3xl rounded-2xl border border-hairline/80 p-4 shadow-sm sm:p-6">
          {entry.status === "loading" ? (
            <PendingBubble />
          ) : (
            <div className="text-[15px] leading-7 text-[color:var(--dp-chat-bubble-assistant-fg)]">
              <MarkdownBubble
                content={entry.content}
                isStreaming={entry.status === "streaming"}
                className="text-[color:var(--dp-chat-bubble-assistant-fg)]"
              />
            </div>
          )}
          {entry.status === "done" ? <SourceList sources={entry.meta?.retrieval?.sources} /> : null}
          {entry.status === "done" && Array.isArray(entry.meta?.pendingActions)
            ? entry.meta.pendingActions.map((action) => (
                <ChatActionDraft
                  key={action.id}
                  action={action}
                  collections={collections}
                  onApprove={(actionId, collectionId) => onApproveAction?.(entry.id, actionId, collectionId)}
                  onDismiss={(actionId) => onDismissAction?.(entry.id, actionId)}
                />
              ))
            : null}
        </article>
      )}
    </div>
  );
}

export default memo(ChatMessageBubble);
