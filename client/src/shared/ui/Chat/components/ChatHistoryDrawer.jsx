import {
  Check,
  Edit2,
  MessageSquare,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function getGroupKey(dateString) {
  if (!dateString) return "Older";
  const date = new Date(dateString);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  if (isToday) return "Today";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
  if (isYesterday) return "Yesterday";

  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) return "Previous 7 Days";

  return "Older";
}

export default function ChatHistoryDrawer({
  open,
  onClose,
  sessions = [],
  activeSessionId,
  onSelectSession,
  onNewChat,
  onRenameSession,
  onDeleteSession,
  loading = false,
}) {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    if (!open) {
      setSearch("");
      setEditingId(null);
    }
  }, [open]);

  const filteredSessions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sessions;
    return sessions.filter((s) => (s.title || "Untitled").toLowerCase().includes(query));
  }, [search, sessions]);

  const groupedSessions = useMemo(() => {
    const groups = {
      Today: [],
      Yesterday: [],
      "Previous 7 Days": [],
      Older: [],
    };

    filteredSessions.forEach((session) => {
      const groupKey = getGroupKey(session.lastMessageAt || session.updatedAt);
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(session);
    });

    return groups;
  }, [filteredSessions]);

  const handleStartRename = (session, e) => {
    e.stopPropagation();
    setEditingId(session._id);
    setEditTitle(session.title || "");
  };

  const handleSaveRename = async (sessionId, e) => {
    e?.stopPropagation();
    if (!editTitle.trim()) return;
    try {
      await onRenameSession?.(sessionId, editTitle.trim());
      setEditingId(null);
    } catch {
      // Ignore
    }
  };

  const handleDelete = (sessionId, e) => {
    e.stopPropagation();
    if (window.confirm("Delete this conversation thread?")) {
      onDeleteSession?.(sessionId);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-[80] transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[24rem] bg-surface-card border-l border-hairline shadow-2xl z-[85] flex flex-col motion-safe:transition-transform motion-safe:duration-200">
        {/* Header */}
        <div className="shrink-0 p-4 border-b border-hairline flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-primary" />
            <h2 className="font-bold text-sm text-ink">Chat History</h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                onNewChat?.();
                onClose();
              }}
              className="inline-flex items-center gap-1 bg-primary hover:bg-primary-active text-canvas text-xs font-semibold px-3 py-1.5 rounded-full transition-colors shadow-sm"
              title="Start new conversation"
            >
              <Plus size={14} />
              <span>New</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-muted hover:text-ink p-1.5 rounded-full hover:bg-canvas-soft transition-colors"
              aria-label="Close drawer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-hairline/60">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-muted-soft pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-canvas-soft border border-hairline rounded-full text-ink placeholder-muted-soft outline-none focus:border-primary/40 transition-colors"
            />
          </div>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {loading ? (
            <div className="text-center py-8 text-xs text-muted">Loading history...</div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageSquare size={32} className="mx-auto text-muted-soft opacity-50 mb-2" />
              <p className="text-xs font-semibold text-ink">No conversations found</p>
              <p className="text-[11px] text-muted-soft mt-0.5">
                {search ? "Try a different search term." : "Start a new conversation to begin."}
              </p>
            </div>
          ) : (
            Object.entries(groupedSessions).map(([groupTitle, groupItems]) => {
              if (!groupItems.length) return null;

              return (
                <div key={groupTitle} className="space-y-1.5">
                  <p className="text-[10px] font-bold text-muted-soft uppercase tracking-wider px-2">
                    {groupTitle}
                  </p>

                  <div className="space-y-1">
                    {groupItems.map((session) => {
                      const isActive = session._id === activeSessionId;
                      const isEditing = editingId === session._id;

                      return (
                        <div
                          key={session._id}
                          onClick={() => {
                            if (!isEditing) {
                              onSelectSession?.(session._id);
                              onClose();
                            }
                          }}
                          className={`group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-all cursor-pointer ${
                            isActive
                              ? "bg-primary/10 border border-primary/30 text-ink font-semibold"
                              : "hover:bg-canvas-soft/80 border border-transparent text-muted hover:text-ink"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                            <MessageSquare
                              size={14}
                              className={`shrink-0 ${isActive ? "text-primary" : "text-muted-soft"}`}
                            />

                            {isEditing ? (
                              <div className="flex items-center gap-1.5 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveRename(session._id, e);
                                    if (e.key === "Escape") setEditingId(null);
                                  }}
                                  autoFocus
                                  className="w-full bg-surface-card border border-primary/40 rounded px-1.5 py-0.5 text-xs text-ink outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={(e) => handleSaveRename(session._id, e)}
                                  className="text-primary hover:text-primary-active p-0.5"
                                  title="Save"
                                >
                                  <Check size={14} />
                                </button>
                              </div>
                            ) : (
                              <span className="truncate flex-1">{session.title || "Untitled"}</span>
                            )}
                          </div>

                          {!isEditing && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={(e) => handleStartRename(session, e)}
                                className="p-1 text-muted hover:text-ink rounded hover:bg-hairline-soft transition-colors"
                                title="Rename conversation"
                              >
                                <Edit2 size={12} />
                              </button>

                              <button
                                type="button"
                                onClick={(e) => handleDelete(session._id, e)}
                                className="p-1 text-muted hover:text-rose-500 rounded hover:bg-hairline-soft transition-colors"
                                title="Delete conversation"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
