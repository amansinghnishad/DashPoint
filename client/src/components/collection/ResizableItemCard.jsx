import { useMemo } from "react";
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

export default function ResizableItemCard({
  item,
  layout,
  onLayoutChange,
  containerRef,
  onEdit,
  onDelete,
}) {
  const {
    currentLayout,
    isDragging,
    isResizing,
    handleDragStart,
    handleResizeStart,
  } = useResizableCard({ layout, onLayoutChange, containerRef });

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

      <div className="h-full">
        <div className="p-3">
          {type === "planner" ? (
            <PlannerWidgetBody widget={item?.itemData} />
          ) : (
            <p className="dp-text-muted text-sm line-clamp-6">
              {item?.itemData?.description || item?.itemData?.content || ""}
            </p>
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
