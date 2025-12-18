import { useState, useEffect, useRef, useCallback } from "react";
import {
  Edit3,
  Trash2,
  Youtube,
  FileText,
  StickyNote,
  CheckSquare,
  ExternalLink,
  Copy,
  Move,
} from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { copyToClipboard } from "../../utils/helpers";
import {
  YouTubeItem,
  ContentItem,
  StickyNoteItem,
  TodoItem,
  FileItem,
} from "./items";

export const ResizableItemCard = ({
  item,
  onDelete,
  onView,
  initialSize,
  layout,
  onLayoutChange,
  containerRef,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef(null);
  const resizeStartRef = useRef(null);
  const { success } = useToast();

  const currentLayout = layout || {
    x: 0,
    y: 0,
    width: initialSize?.width ?? 320,
    height: initialSize?.height ?? 240,
  };

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
      const clamped = clampLayout(next);
      onLayoutChange?.(clamped);
    },
    [clampLayout, onLayoutChange]
  );

  // Handle resize drag
  const handleResizeStart = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      resizeStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        width: currentLayout.width,
        height: currentLayout.height,
      };

      setIsResizing(true);

      const handleMouseMove = (moveEvent) => {
        const startData = resizeStartRef.current;
        if (!startData) return;

        const deltaX = moveEvent.clientX - startData.x;
        const deltaY = moveEvent.clientY - startData.y;

        commitLayout({
          ...currentLayout,
          width: startData.width + deltaX,
          height: startData.height + deltaY,
        });
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        resizeStartRef.current = null;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "se-resize";
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
        const startData = dragStartRef.current;
        if (!startData) return;

        const dx = moveEvent.clientX - startData.mouseX;
        const dy = moveEvent.clientY - startData.mouseY;
        commitLayout({
          ...currentLayout,
          x: startData.startX + dx,
          y: startData.startY + dy,
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, []);
  const getIcon = () => {
    switch (item.itemType) {
      case "youtube":
        return <Youtube size={16} className="text-red-500" />;
      case "content":
        return <FileText size={16} className="text-blue-500" />;
      case "sticky-note":
        return <StickyNote size={16} className="text-yellow-500" />;
      case "todo":
        return <CheckSquare size={16} className="text-green-500" />;
      case "file":
        return <FileText size={16} className="text-gray-700" />;
      default:
        return <FileText size={16} className="text-gray-500" />;
    }
  };

  const handleCopy = async (text) => {
    const copied = await copyToClipboard(text);
    if (copied) {
      success("Content copied to clipboard");
    }
  };

  const handleExternalOpen = () => {
    if (item.itemData?.url || item.itemData?.embedUrl) {
      window.open(item.itemData.url || item.itemData.embedUrl, "_blank");
    }
  };

  const renderContent = () => {
    switch (item.itemType) {
      case "youtube":
        return <YouTubeItem item={item} />;
      case "content":
        return <ContentItem item={item} />;
      case "sticky-note":
        return <StickyNoteItem item={item} />;
      case "todo":
        return <TodoItem item={item} />;
      case "file":
        return <FileItem item={item} />;
      default:
        return (
          <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <FileText size={32} className="mx-auto mb-2" />
              <p className="text-sm">Unknown item type</p>
            </div>
          </div>
        );
    }
  };
  return (
    <div
      className={`group relative bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-shadow ${
        isResizing || isDragging
          ? "ring-2 ring-blue-500/30 shadow-md"
          : "hover:shadow-md"
      }`}
      style={{
        position: "absolute",
        left: currentLayout.x,
        top: currentLayout.y,
        width: currentLayout.width,
        height: currentLayout.height,
        minWidth: 280,
        minHeight: 200,
      }}
    >
      {/* Header */}
      <div
        className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 p-3 flex items-center justify-between z-10 cursor-move"
        onMouseDown={handleDragStart}
        title="Drag to move"
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0">{getIcon()}</div>
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {item.itemData?.title || `${item.itemType} item`}
          </h3>
        </div>

        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {(item.itemData?.url || item.itemData?.embedUrl) && (
            <button
              onMouseDown={(ev) => ev.stopPropagation()}
              onClick={handleExternalOpen}
              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
              title="Open in new tab"
            >
              <ExternalLink size={14} />
            </button>
          )}

          {(item.itemData?.content || item.itemData?.text) && (
            <button
              onMouseDown={(ev) => ev.stopPropagation()}
              onClick={() =>
                handleCopy(item.itemData.content || item.itemData.text)
              }
              className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
              title="Copy content"
            >
              <Copy size={14} />
            </button>
          )}

          <button
            onMouseDown={(ev) => ev.stopPropagation()}
            onClick={() => onView(item)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            title="View details"
          >
            <Edit3 size={14} />
          </button>

          <button
            onMouseDown={(ev) => ev.stopPropagation()}
            onClick={() => onDelete(item)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            title="Remove from collection"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Content area with improved styling */}
      <div className="absolute top-16 left-0 right-0 bottom-6 p-2">
        <div className="w-full h-full rounded-xl overflow-hidden">
          {renderContent()}
        </div>
      </div>

      {/* Enhanced resize handle */}
      <div
        className="absolute bottom-2 right-2 w-6 h-6 cursor-se-resize bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-colors duration-200"
        onMouseDown={handleResizeStart}
      >
        <Move size={12} className="text-gray-600" />
      </div>

      {/* Loading indicator during resize */}
      {isResizing && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500/60" />
      )}
    </div>
  );
};
