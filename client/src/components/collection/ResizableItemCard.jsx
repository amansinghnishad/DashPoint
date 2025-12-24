import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckSquare,
  FileText,
  Image,
  Move,
  Pencil,
  StickyNote,
  Trash2,
  Youtube,
} from "lucide-react";

const RESIZE_DIRECTIONS = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

const getCursorForResizeDir = (dir) => {
  switch (dir) {
    case "n":
      return "n-resize";
    case "s":
      return "s-resize";
    case "e":
      return "e-resize";
    case "w":
      return "w-resize";
    case "ne":
      return "ne-resize";
    case "nw":
      return "nw-resize";
    case "se":
      return "se-resize";
    case "sw":
      return "sw-resize";
    default:
      return "default";
  }
};

const getTitleForItem = (item) => {
  const data = item?.itemData;
  if (!data || typeof data !== "object") return "Item";

  return (
    data.title ||
    data.name ||
    data.filename ||
    data.originalName ||
    data.url ||
    data.videoTitle ||
    "Item"
  );
};

const getTypeIcon = (itemType) => {
  switch (itemType) {
    case "youtube":
      return Youtube;
    case "content":
      return FileText;
    case "sticky-note":
      return StickyNote;
    case "todo":
      return CheckSquare;
    case "file":
      return FileText;
    case "photo":
      return Image;
    default:
      return FileText;
  }
};

export default function ResizableItemCard({
  item,
  layout,
  onLayoutChange,
  containerRef,
  onEdit,
  onDelete,
}) {
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef(null);
  const resizeStartRef = useRef(null);

  const currentLayout = useMemo(
    () =>
      layout || {
        x: 0,
        y: 0,
        width: 320,
        height: 240,
      },
    [layout]
  );

  const clampLayout = useCallback(
    (next) => {
      const minWidth = 280;
      const minHeight = 200;

      let width = Math.max(minWidth, next.width ?? currentLayout.width);
      let height = Math.max(minHeight, next.height ?? currentLayout.height);
      let x = next.x ?? currentLayout.x;
      let y = next.y ?? currentLayout.y;

      const containerEl = containerRef?.current;
      if (containerEl) {
        const containerRect = containerEl.getBoundingClientRect();

        width = Math.min(width, Math.max(minWidth, containerRect.width));
        height = Math.min(height, Math.max(minHeight, containerRect.height));

        const maxX = Math.max(0, containerRect.width - width);
        const maxY = Math.max(0, containerRect.height - height);
        x = Math.min(Math.max(0, x), maxX);
        y = Math.min(Math.max(0, y), maxY);
      }

      return { x, y, width, height };
    },
    [
      containerRef,
      currentLayout.height,
      currentLayout.width,
      currentLayout.x,
      currentLayout.y,
    ]
  );

  const commitLayout = useCallback(
    (next) => {
      onLayoutChange?.(clampLayout(next));
    },
    [clampLayout, onLayoutChange]
  );

  const handleResizeStart = useCallback(
    (e, dir) => {
      if (!RESIZE_DIRECTIONS.includes(dir)) return;
      e.preventDefault();
      e.stopPropagation();

      resizeStartRef.current = {
        pointerId: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        startLayout: { ...currentLayout },
        dir,
      };

      setIsResizing(true);

      const onPointerMove = (moveEvent) => {
        const start = resizeStartRef.current;
        if (!start) return;
        if (moveEvent.pointerId !== start.pointerId) return;

        const dx = moveEvent.clientX - start.x;
        const dy = moveEvent.clientY - start.y;

        const next = { ...start.startLayout };
        const d = start.dir;

        // Horizontal
        if (d.includes("e")) {
          next.width = start.startLayout.width + dx;
        }
        if (d.includes("w")) {
          next.width = start.startLayout.width - dx;
          next.x = start.startLayout.x + dx;
        }

        // Vertical
        if (d.includes("s")) {
          next.height = start.startLayout.height + dy;
        }
        if (d.includes("n")) {
          next.height = start.startLayout.height - dy;
          next.y = start.startLayout.y + dy;
        }

        commitLayout(next);
      };

      const endResize = (endEvent) => {
        const start = resizeStartRef.current;
        if (!start) return;
        if (endEvent.pointerId !== start.pointerId) return;

        setIsResizing(false);
        resizeStartRef.current = null;
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", endResize);
        document.removeEventListener("pointercancel", endResize);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", endResize);
      document.addEventListener("pointercancel", endResize);
      document.body.style.cursor = getCursorForResizeDir(dir);
      document.body.style.userSelect = "none";
    },
    [commitLayout, currentLayout]
  );

  const handleDragStart = useCallback(
    (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();

      dragStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        startX: currentLayout.x,
        startY: currentLayout.y,
      };

      setIsDragging(true);

      const handleMouseMove = (moveEvent) => {
        const start = dragStartRef.current;
        if (!start) return;

        const dx = moveEvent.clientX - start.mouseX;
        const dy = moveEvent.clientY - start.mouseY;

        commitLayout({
          ...currentLayout,
          x: start.startX + dx,
          y: start.startY + dy,
        });
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        dragStartRef.current = null;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "move";
      document.body.style.userSelect = "none";
    },
    [commitLayout, currentLayout]
  );

  useEffect(() => {
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, []);

  const title = getTitleForItem(item);
  const type = item?.itemType || "item";
  const Icon = getTypeIcon(type);

  return (
    <div
      className={`group absolute dp-surface dp-border rounded-2xl border shadow-lg overflow-hidden ${
        isDragging || isResizing ? "shadow-2xl" : ""
      }`}
      style={{
        left: currentLayout.x,
        top: currentLayout.y,
        width: currentLayout.width,
        height: currentLayout.height,
        minWidth: 280,
        minHeight: 200,
      }}
    >
      <div
        className="dp-surface dp-border border-b px-3 py-2 flex items-center justify-between cursor-move select-none"
        onMouseDown={handleDragStart}
        title="Drag to move"
      >
        <div className="min-w-0 flex items-center gap-2">
          <Icon size={16} className="dp-text-muted" />
          <p className="dp-text text-sm font-semibold truncate">{title}</p>
        </div>
        <div className="dp-text-muted flex items-center gap-1 text-xs whitespace-nowrap">
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(item);
            }}
            className="dp-text-muted dp-hover-bg dp-hover-text inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            aria-label="Edit item"
            title="Edit"
          >
            <Pencil size={14} />
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(item);
            }}
            className="dp-text-muted dp-hover-bg dp-hover-text inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            aria-label="Delete item"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>

          <span className="mx-1 hidden sm:inline">{type}</span>
          <Move size={14} />
        </div>
      </div>

      <div className="h-full">
        <div className="p-3">
          <p className="dp-text-muted text-sm line-clamp-6">
            {item?.itemData?.description || item?.itemData?.content || ""}
          </p>
        </div>
      </div>

      {/* Resize handles (sides + corners) */}
      <div className="pointer-events-none absolute inset-0">
        {/* Sides */}
        <div
          role="presentation"
          onPointerDown={(e) => handleResizeStart(e, "n")}
          className="pointer-events-auto absolute left-8 right-8 top-0 h-2 cursor-n-resize opacity-0 group-hover:opacity-100 transition-opacity"
          title="Resize"
        />
        <div
          role="presentation"
          onPointerDown={(e) => handleResizeStart(e, "s")}
          className="pointer-events-auto absolute left-8 right-8 bottom-0 h-2 cursor-s-resize opacity-0 group-hover:opacity-100 transition-opacity"
          title="Resize"
        />
        <div
          role="presentation"
          onPointerDown={(e) => handleResizeStart(e, "w")}
          className="pointer-events-auto absolute top-8 bottom-8 left-0 w-2 cursor-w-resize opacity-0 group-hover:opacity-100 transition-opacity"
          title="Resize"
        />
        <div
          role="presentation"
          onPointerDown={(e) => handleResizeStart(e, "e")}
          className="pointer-events-auto absolute top-8 bottom-8 right-0 w-2 cursor-e-resize opacity-0 group-hover:opacity-100 transition-opacity"
          title="Resize"
        />

        {/* Corners (small visible grab area on hover) */}
        <div
          role="presentation"
          onPointerDown={(e) => handleResizeStart(e, "nw")}
          className="pointer-events-auto absolute left-1 top-1 h-3 w-3 cursor-nw-resize rounded-sm dp-hover-bg opacity-0 group-hover:opacity-100 transition-opacity"
          title="Resize"
        />
        <div
          role="presentation"
          onPointerDown={(e) => handleResizeStart(e, "ne")}
          className="pointer-events-auto absolute right-1 top-1 h-3 w-3 cursor-ne-resize rounded-sm dp-hover-bg opacity-0 group-hover:opacity-100 transition-opacity"
          title="Resize"
        />
        <div
          role="presentation"
          onPointerDown={(e) => handleResizeStart(e, "sw")}
          className="pointer-events-auto absolute left-1 bottom-1 h-3 w-3 cursor-sw-resize rounded-sm dp-hover-bg opacity-0 group-hover:opacity-100 transition-opacity"
          title="Resize"
        />
        <div
          role="presentation"
          onPointerDown={(e) => handleResizeStart(e, "se")}
          className="pointer-events-auto absolute right-1 bottom-1 h-3 w-3 cursor-se-resize rounded-sm dp-hover-bg opacity-0 group-hover:opacity-100 transition-opacity"
          title="Resize"
        />
      </div>
    </div>
  );
}
