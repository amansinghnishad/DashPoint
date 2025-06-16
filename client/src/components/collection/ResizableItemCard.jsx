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
      className={`relative bg-white border border-gray-200 rounded-lg shadow-sm transition-all duration-200 ${
        isResizing ? "shadow-lg ring-2 ring-blue-500" : "hover:shadow-md"
      }`}
      style={{
        width: size.width,
        height: size.height,
        minWidth: 280,
        minHeight: 200,
      }}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-white bg-opacity-95 backdrop-blur-sm border-b border-gray-200 rounded-t-lg p-2 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          {getIcon()}
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {item.itemData?.title || `${item.itemType} item`}
          </h3>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            title={isExpanded ? "Minimize" : "Maximize"}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          {(item.itemData?.url || item.itemData?.embedUrl) && (
            <button
              onClick={handleExternalOpen}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
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
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              title="Copy content"
            >
              <Copy size={14} />
            </button>
          )}

          <button
            onClick={() => onView(item)}
            className="p-1 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded"
            title="View details"
          >
            <Edit3 size={14} />
          </button>

          <button
            onClick={() => onDelete(item)}
            className="p-1 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded"
            title="Remove from collection"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        className={`absolute top-12 left-0 right-0 bottom-0 ${
          isExpanded ? "z-20" : ""
        }`}
      >
        {renderContent()}
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-gray-300 hover:bg-gray-400 rounded-tl-lg flex items-center justify-center"
        onMouseDown={handleResizeStart}
        style={{
          backgroundImage: "radial-gradient(circle, #666 1px, transparent 1px)",
          backgroundSize: "4px 4px",
        }}
      >
        <Move size={12} className="text-gray-600" />
      </div>

      {/* Expanded overlay */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getIcon()}
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.itemData?.title || `${item.itemType} item`}
                </h3>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              >
                <Minimize2 size={18} />
              </button>
            </div>
            <div
              className="p-4"
              style={{ minHeight: "400px", minWidth: "600px" }}
            >
              {renderContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
