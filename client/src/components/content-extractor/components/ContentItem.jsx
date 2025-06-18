import { useState } from "react";
import {
  Copy,
  ExternalLink,
  Globe,
  BookOpen,
  Clock,
  Trash2,
  FolderPlus,
  Check,
} from "lucide-react";
import { getDomainFromUrl } from "../../../utils/urlUtils";
import { copyToClipboard, truncateText } from "../../../utils/helpers";
import { formatDateTime } from "../../../utils/dateUtils";

export const ContentItem = ({
  content,
  onSelect,
  isSelected,
  onDelete,
  onAddToCollection,
}) => {
  const [copied, setCopied] = useState(false);

  // handleCopy function
  const handleCopy = async (text) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // handleDelete function
  const handleDelete = (e) => {
    e.stopPropagation();
    if (
      window.confirm("Are you sure you want to delete this extracted content?")
    ) {
      onDelete(content._id);
    }
  };

  // handleAddToCollection function
  const handleAddToCollection = (e) => {
    e.stopPropagation();
    onAddToCollection(content);
  };

  return (
    <div
      className={`group relative bg-white rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected
          ? "border-blue-400 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 transform scale-[1.02]"
          : "border-gray-200 hover:border-gray-300 shadow-sm"
      }`}
      onClick={() => onSelect(content)}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
          <Check size={12} className="text-white" />
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Globe size={14} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-gray-900 truncate">
                {getDomainFromUrl(content.url)}
              </div>
              <div className="text-xs text-gray-500">
                {formatDateTime(content.extractedAt)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(content.text);
              }}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              title="Copy content"
            >
              {copied ? (
                <Check size={14} className="text-green-500" />
              ) : (
                <Copy size={14} />
              )}
            </button>
            <button
              onClick={handleAddToCollection}
              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
              title="Add to collection"
            >
              <FolderPlus size={14} />
            </button>
            <a
              href={content.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
              title="Open original"
            >
              <ExternalLink size={14} />
            </a>
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title="Delete content"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm leading-tight">
          {content.title || "Untitled"}
        </h3>

        {/* Content Preview */}
        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-3">
          {truncateText(content.text, 150)}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1 text-xs text-gray-500">
              <BookOpen size={12} />
              <span>{content.wordCount} words</span>
            </span>
            <span className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock size={12} />
              <span>{Math.ceil(content.wordCount / 200)} min</span>
            </span>
          </div>

          {/* Reading Progress Indicator */}
          <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
              style={{ width: isSelected ? "100%" : "0%" }}
            ></div>
          </div>
        </div>

        {/* Copy Success Message */}
        {copied && (
          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Check size={14} className="text-green-600" />
              <span className="text-xs font-medium text-green-800">
                Content copied to clipboard!
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
