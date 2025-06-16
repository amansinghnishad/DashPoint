import { X, ExternalLink, Copy, Calendar } from "lucide-react";
import { useToast } from "../../../hooks/useToast";
import { copyToClipboard } from "../../../utils/helpers";
import { formatDateTime } from "../../../utils/dateUtils";

export const ItemDetailsModal = ({ item, isOpen, onClose }) => {
  const { success } = useToast();

  const handleCopy = async (text) => {
    const copied = await copyToClipboard(text);
    if (copied) {
      success("Content copied to clipboard");
    }
  };

  const handleExternalOpen = () => {
    if (item?.itemData?.url || item?.itemData?.embedUrl) {
      window.open(item.itemData.url || item.itemData.embedUrl, "_blank");
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Item Details</h2>
          <div className="flex items-center space-x-2">
            {(item.itemData?.url || item.itemData?.embedUrl) && (
              <button
                onClick={handleExternalOpen}
                className="p-2 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                title="Open in new tab"
              >
                <ExternalLink size={16} />
              </button>
            )}
            {(item.itemData?.content || item.itemData?.text) && (
              <button
                onClick={() =>
                  handleCopy(item.itemData.content || item.itemData.text)
                }
                className="p-2 text-gray-500 hover:text-green-700 hover:bg-green-50 rounded"
                title="Copy content"
              >
                <Copy size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {item.itemData?.title || `${item.itemType} Item`}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="capitalize">
                {item.itemType.replace("-", " ")}
              </span>
              {item.createdAt && (
                <span className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>Added {formatDateTime(item.createdAt)}</span>
                </span>
              )}
            </div>
          </div>

          {/* URL */}
          {(item.itemData?.url || item.itemData?.embedUrl) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <a
                href={item.itemData.url || item.itemData.embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {item.itemData.url || item.itemData.embedUrl}
              </a>
            </div>
          )}

          {/* Content */}
          {(item.itemData?.content ||
            item.itemData?.text ||
            item.itemData?.description) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {item.itemData.content ||
                    item.itemData.text ||
                    item.itemData.description}
                </p>
              </div>
            </div>
          )}

          {/* YouTube specific fields */}
          {item.itemType === "youtube" && (
            <>
              {item.itemData?.channelTitle && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Channel
                  </label>
                  <p className="text-gray-600">{item.itemData.channelTitle}</p>
                </div>
              )}

              {item.itemData?.duration && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <p className="text-gray-600">{item.itemData.duration}</p>
                </div>
              )}

              {item.itemData?.viewCount && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Views
                  </label>
                  <p className="text-gray-600">
                    {item.itemData.viewCount.toLocaleString()}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Todo specific fields */}
          {item.itemType === "todo" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs ${
                    item.itemData?.completed
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {item.itemData?.completed ? "Completed" : "Pending"}
                </span>
              </div>

              {item.itemData?.priority && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs ${
                      item.itemData.priority === "high"
                        ? "bg-red-100 text-red-700"
                        : item.itemData.priority === "medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {item.itemData.priority} priority
                  </span>
                </div>
              )}

              {item.itemData?.dueDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <p className="text-gray-600">
                    {new Date(item.itemData.dueDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              {item.itemData?.category && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <p className="text-gray-600">{item.itemData.category}</p>
                </div>
              )}
            </>
          )}

          {/* Sticky Note specific fields */}
          {item.itemType === "sticky-note" && item.itemData?.color && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="flex items-center space-x-2">
                <div
                  className="w-6 h-6 rounded border border-gray-300"
                  style={{ backgroundColor: item.itemData.color }}
                ></div>
                <span className="text-gray-600">{item.itemData.color}</span>
              </div>
            </div>
          )}

          {/* Metadata */}
          {item.itemData?.author && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author
              </label>
              <p className="text-gray-600">{item.itemData.author}</p>
            </div>
          )}

          {item.itemData?.publishedAt && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Published
              </label>
              <p className="text-gray-600">
                {formatDateTime(item.itemData.publishedAt)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
