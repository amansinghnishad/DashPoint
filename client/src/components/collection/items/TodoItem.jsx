import { useState } from "react";
import { getPriorityColor } from "../utils/itemHelpers";

export const TodoItem = ({ item, className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`w-full h-full p-3 bg-white rounded-lg ${className}`}>
      <div className="mb-2">
        <h4 className="font-semibold text-sm text-gray-900">
          {item.itemData?.title || "Todo Item"}
        </h4>
        <div className="flex items-center space-x-2 mt-1">
          <div
            className={`w-3 h-3 rounded border-2 flex items-center justify-center ${
              item.itemData?.completed
                ? "bg-green-500 border-green-500"
                : "border-gray-300"
            }`}
          >
            {item.itemData?.completed && (
              <div className="w-1 h-1 bg-white rounded-full"></div>
            )}
          </div>
          <span
            className={`text-xs ${
              item.itemData?.completed
                ? "text-green-600 line-through"
                : "text-gray-600"
            }`}
          >
            {item.itemData?.completed ? "Completed" : "Pending"}
          </span>
        </div>
      </div>
      <div
        className={`text-sm text-gray-700 ${
          isExpanded ? "overflow-y-auto h-full" : "line-clamp-4"
        }`}
      >
        {item.itemData?.description ||
          item.itemData?.content ||
          "No description"}
      </div>{" "}
      {item.itemData?.priority && (
        <div className="mt-2">
          <span
            className={`text-xs px-2 py-1 rounded ${getPriorityColor(
              item.itemData.priority
            )}`}
          >
            {item.itemData.priority} priority
          </span>
        </div>
      )}
      {item.itemData?.dueDate && (
        <div className="mt-2 text-xs text-gray-500">
          Due: {new Date(item.itemData.dueDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};
