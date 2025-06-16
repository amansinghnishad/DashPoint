import { useState } from "react";

export const StickyNoteItem = ({ item, className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`w-full h-full p-3 rounded-lg ${className}`}
      style={{ backgroundColor: item.itemData?.color || "#fef3c7" }}
    >
      <div className="mb-2">
        <h4 className="font-semibold text-sm text-gray-900">
          {item.itemData?.title || "Sticky Note"}
        </h4>
      </div>
      <div
        className={`text-sm text-gray-700 ${
          isExpanded ? "overflow-y-auto h-full" : "line-clamp-6"
        }`}
      >
        {item.itemData?.content || item.itemData?.text || "Empty note"}
      </div>
      {item.itemData?.content && item.itemData.content.length > 100 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-xs text-gray-600 hover:underline"
        >
          {isExpanded ? "Show less" : "Show more..."}
        </button>
      )}
    </div>
  );
};
