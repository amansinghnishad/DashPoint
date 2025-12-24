import {
  CheckSquare,
  FileText,
  Image,
  StickyNote,
  Youtube,
} from "lucide-react";
import { useMemo } from "react";

export default function BottomBar({
  activeTool,
  onSelectTool,
  className = "",
  show = true,
}) {
  const tools = useMemo(
    () => [
      { id: "note", label: "Note", Icon: StickyNote },
      { id: "todo", label: "Todo", Icon: CheckSquare },
      { id: "photo", label: "Photo", Icon: Image },
      { id: "youtube", label: "YouTube", Icon: Youtube },
      { id: "file", label: "File", Icon: FileText },
    ],
    []
  );

  if (!show) return null;

  return (
    <div
      className={`absolute left-1/2 bottom-4 -translate-x-1/2 z-20 ${className}`}
    >
      <div className="dp-surface dp-border rounded-2xl border shadow-lg px-2 py-2">
        <div className="flex items-center gap-1">
          {tools.map(({ id, label, Icon }, index) => {
            const isActive = activeTool === id;
            const isDivider = index === 2;

            return (
              <div key={id} className="flex items-center">
                {isDivider ? <div className="mx-1 h-6 w-px dp-border" /> : null}
                <button
                  type="button"
                  onClick={() => onSelectTool?.(id)}
                  title={label}
                  aria-label={label}
                  className={
                    isActive
                      ? "dp-btn-primary inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
                      : "dp-text-muted dp-hover-bg dp-hover-text inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
                  }
                >
                  <Icon size={18} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
