import { useState } from "react";

export const ContentItem = ({ item, className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`w-full h-full p-3 overflow-hidden bg-white rounded-lg ${className}`}
    >
      <div className="mb-2">
        <h4 className="font-semibold text-sm text-gray-900 line-clamp-2">
          {item.itemData?.title || "Web Content"}
        </h4>
        {item.itemData?.url && (
          <a
            href={item.itemData.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline line-clamp-1"
          >
            {item.itemData.url}
          </a>
        )}
      </div>
      <div
        className={`text-sm text-gray-700 ${
          isExpanded ? "overflow-y-auto h-full" : "line-clamp-6"
        }`}
      >
        {item.itemData?.content ||
          item.itemData?.text ||
          "No content available"}
      </div>
      {item.itemData?.content && item.itemData.content.length > 200 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-xs text-blue-600 hover:underline"
        >
          {isExpanded ? "Show less" : "Read more..."}
        </button>
      )}
    </div>
  );
};
