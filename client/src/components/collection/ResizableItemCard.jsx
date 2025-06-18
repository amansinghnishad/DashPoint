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
  Maximize2,
  Minimize2,
  Move,
} from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { copyToClipboard } from "../../utils/helpers";
import { YouTubeItem, ContentItem, StickyNoteItem, TodoItem } from "./items";

export const ResizableItemCard = ({
  item,
  onEdit,
  onDelete,
  onView,
  initialSize,
}) => {
  const [size, setSize] = useState(initialSize || { width: 320, height: 240 });
  const [isResizing, setIsResizing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef(null);
  const { success, error } = useToast();

  // Handle resize drag
  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = cardRef.current.getBoundingClientRect();
    const startData = {
      x: e.clientX,
      y: e.clientY,
      width: rect.width,
      height: rect.height,
    };

    setIsResizing(true);

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startData.x;
      const deltaY = moveEvent.clientY - startData.y;

      const newWidth = Math.max(280, startData.width + deltaX);
      const newHeight = Math.max(200, startData.height + deltaY);

      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "se-resize";
    document.body.style.userSelect = "none";
  }, []);

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
      ref={cardRef}
      className={`group relative bg-white/90 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg transition-all duration-300 overflow-hidden ${
        isResizing
          ? "shadow-2xl ring-2 ring-blue-500/50 scale-105"
          : "hover:shadow-xl hover:transform hover:scale-[1.02] hover:border-blue-200/50"
      }`}
      style={{
        width: size.width,
        height: size.height,
        minWidth: 280,
        minHeight: 200,
      }}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

      {/* Header with enhanced styling */}
      <div className="absolute top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 rounded-t-2xl p-3 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0">{getIcon()}</div>
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {item.itemData?.title || `${item.itemType} item`}
          </h3>
        </div>

        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            title={isExpanded ? "Minimize" : "Maximize"}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          {(item.itemData?.url || item.itemData?.embedUrl) && (
            <button
              onClick={handleExternalOpen}
              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
              title="Open in new tab"
            >
              <ExternalLink size={14} />
            </button>
          )}

          {(item.itemData?.content || item.itemData?.text) && (
            <button
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
            onClick={() => onView(item)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            title="View details"
          >
            <Edit3 size={14} />
          </button>

          <button
            onClick={() => onDelete(item)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            title="Remove from collection"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Content area with improved styling */}
      <div
        className={`absolute top-16 left-0 right-0 bottom-6 p-2 ${
          isExpanded ? "z-20" : ""
        }`}
      >
        <div className="w-full h-full rounded-xl overflow-hidden">
          {renderContent()}
        </div>
      </div>

      {/* Enhanced resize handle */}
      <div
        className="absolute bottom-2 right-2 w-6 h-6 cursor-se-resize bg-gradient-to-br from-gray-300 to-gray-400 hover:from-blue-400 hover:to-indigo-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm hover:shadow-md"
        onMouseDown={handleResizeStart}
      >
        <Move size={12} className="text-white" />
      </div>

      {/* Loading indicator during resize */}
      {isResizing && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-2xl animate-pulse" />
      )}

      {/* Enhanced expanded modal */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl max-w-6xl max-h-[90vh] overflow-auto shadow-2xl border border-white/20">
            <div className="p-6 border-b border-gray-200/50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  {getIcon()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {item.itemData?.title || `${item.itemType} item`}
                  </h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {item.itemType.replace("-", " ")} • Collection Item
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <Minimize2 size={20} />
              </button>
            </div>
            <div
              className="p-6"
              style={{ minHeight: "500px", minWidth: "700px" }}
            >
              {renderContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
