import { useState } from "react";
import {
  Copy,
  ExternalLink,
  Globe,
  BookOpen,
  Clock,
  Trash2,
  FolderPlus,
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
      className={`bg-white rounded-lg shadow-sm border p-4 cursor-pointer transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={() => onSelect(content)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <Globe size={16} className="text-gray-400" />
          <span className="text-sm text-gray-600">
            {getDomainFromUrl(content.url)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            {formatDateTime(content.extractedAt)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy(content.text);
            }}
            className="text-gray-400 hover:text-gray-600 p-1"
            title="Copy content"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={handleAddToCollection}
            className="text-gray-400 hover:text-blue-600 p-1"
            title="Add to collection"
          >
            <FolderPlus size={14} />
          </button>
          <a
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-gray-400 hover:text-gray-600 p-1"
            title="Open original"
          >
            <ExternalLink size={14} />
          </a>
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-600 p-1"
            title="Delete content"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
        {content.title || "Untitled"}
      </h3>

      <p className="text-sm text-gray-600 line-clamp-3 mb-3">
        {truncateText(content.text, 200)}
      </p>

      <div className="flex items-center space-x-4 text-xs text-gray-500">
        <span className="flex items-center space-x-1">
          <BookOpen size={12} />
          <span>{content.wordCount} words</span>
        </span>
        <span className="flex items-center space-x-1">
          <Clock size={12} />
          <span>{Math.ceil(content.wordCount / 200)} min read</span>
        </span>
      </div>

      {copied && (
        <div className="mt-2 text-xs text-green-600 font-medium">
          Content copied to clipboard!
        </div>
      )}
    </div>
  );
};
