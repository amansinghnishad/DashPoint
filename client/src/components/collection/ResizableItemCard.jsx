import {
  FileText,
  Image,
  LayoutGrid,
  Move,
  Pencil,
  Trash2,
  Youtube,
} from "lucide-react";

import { PlannerWidgetBody } from "./plannerWidgets";

import { extractYouTubeId } from "../../utils/urlUtils";

import { useResizableCard } from "./useResizableCard";

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
    case "file":
      return FileText;
    case "photo":
      return Image;
    case "planner":
      return LayoutGrid;
    default:
      return FileText;
  }
};

const getYouTubeEmbedSrc = (data) => {
  if (!data || typeof data !== "object") return null;

  // Prefer the server-provided embedUrl.
  if (typeof data.embedUrl === "string" && data.embedUrl.trim()) {
    return data.embedUrl.trim();
  }

  // Fall back to url/videoId if embedUrl isn't present.
  const videoId =
    (typeof data.videoId === "string" && data.videoId.trim()) ||
    extractYouTubeId(String(data.url || ""));

  if (!videoId) return null;

  // Privacy-enhanced mode.
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
};

export default function ResizableItemCard({
  item,
  layout,
  onLayoutChange,
  containerRef,
  viewportScale,
  onEdit,
  onDelete,
}) {
  // When the canvas is zoomed (Ctrl+wheel), drag/resize deltas must be scaled back
  // into world coordinates.
  // Default to 1 to preserve existing behavior.
  const effectiveScale =
    typeof viewportScale === "number" && viewportScale > 0 ? viewportScale : 1;

  const resizable = useResizableCard({
    layout,
    onLayoutChange,
    containerRef,
    viewportScale: effectiveScale,
    constrainToContainer: false,
  });

  const {
    currentLayout,
    isDragging,
    isResizing,
    handleDragStart,
    handleResizeStart,
  } = resizable;

  const title = getTitleForItem(item);
  const type = item?.itemType || "item";
  const Icon = getTypeIcon(type);

  const youtubeEmbedSrc =
    type === "youtube" ? getYouTubeEmbedSrc(item?.itemData) : null;

  const bodyClassName =
    type === "youtube"
      ? "flex-1 min-h-0 overflow-hidden touch-auto"
      : "flex-1 min-h-0 overflow-auto touch-auto";

  return (
    <div
      className={`group absolute dp-resize-handle-bg dp-border rounded-2xl border shadow-lg overflow-hidden flex flex-col ${
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
        className="dp-surface dp-border border-b px-3 py-2 flex items-center justify-between cursor-move select-none touch-none"
        onPointerDown={handleDragStart}
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

      <div className={bodyClassName}>
        <div className="p-3 h-full">
          {type === "planner" ? (
            <PlannerWidgetBody widget={item?.itemData} />
          ) : type === "youtube" ? (
            <div className="h-full w-full dp-border rounded-xl border overflow-hidden bg-black">
              {youtubeEmbedSrc ? (
                <iframe
                  className="h-full w-full"
                  src={youtubeEmbedSrc}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : null}
            </div>
          ) : (
            <div className="h-full" />
          )}
        </div>
      </div>

      {/* Resize handles (sides + corners) */}
      <div className="pointer-events-none absolute inset-0">
        {/* Sides */}
        <div
          role="presentation"
          onPointerDown={(e) => handleResizeStart(e, "n")}
          className="pointer-events-auto absolute left-8 right-8 top-0 h-2 cursor-n-resize opacity-0 group-hover:opacity-100 transition-opacity touch-none"
          title="Resize"
        />
        <div
          role="presentation"
          onPointerDown={(e) => handleResizeStart(e, "s")}
          className="pointer-events-auto absolute left-8 right-8 bottom-0 h-2 cursor-s-resize opacity-0 group-hover:opacity-100 transition-opacity touch-none"
          title="Resize"
        />
        <div
          role="presentation"
          onPointerDown={(e) => handleResizeStart(e, "w")}
          className="pointer-events-auto absolute top-8 bottom-8 left-0 w-2 cursor-w-resize opacity-0 group-hover:opacity-100 transition-opacity touch-none"
          title="Resize"
        />
        <div
          role="presentation"
          onPointerDown={(e) => handleResizeStart(e, "e")}
          className="pointer-events-auto absolute top-8 bottom-8 right-0 w-2 cursor-e-resize opacity-0 group-hover:opacity-100 transition-opacity touch-none"
          title="Resize"
        />

        {/* Corners (small visible grab area on hover) */}
        <div
          role="presentation"
          onPointerDown={(e) => handleResizeStart(e, "nw")}
          className="pointer-events-auto absolute left-0 top-0 h-5 w-5 sm:left-1 sm:top-1 sm:h-3 sm:w-3 cursor-nw-resize rounded-md sm:rounded-sm dp-hover-bg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-none"
          title="Resize"
        />
        <div
          role="presentation"
          onPointerDown={(e) => handleResizeStart(e, "ne")}
          className="pointer-events-auto absolute right-0 top-0 h-5 w-5 sm:right-1 sm:top-1 sm:h-3 sm:w-3 cursor-ne-resize rounded-md sm:rounded-sm dp-hover-bg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-none"
          title="Resize"
        />
        <div
          role="presentation"
          onPointerDown={(e) => handleResizeStart(e, "sw")}
          className="pointer-events-auto absolute left-0 bottom-0 h-5 w-5 sm:left-1 sm:bottom-1 sm:h-3 sm:w-3 cursor-sw-resize rounded-md sm:rounded-sm dp-hover-bg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-none"
          title="Resize"
        />
        <div
          role="presentation"
          onPointerDown={(e) => handleResizeStart(e, "se")}
          className="pointer-events-auto absolute right-0 bottom-0 h-5 w-5 sm:right-1 sm:bottom-1 sm:h-3 sm:w-3 cursor-se-resize rounded-md sm:rounded-sm dp-hover-bg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-none"
          title="Resize"
        />
      </div>
    </div>
  );
}
