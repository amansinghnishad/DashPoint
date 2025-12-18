import { ExternalLink, Copy, Calendar } from "lucide-react";
import { Modal, Button } from "../../ui";
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-3xl"
      showCloseButton={true}
    >
      <div className="flex justify-between items-start gap-4 p-6 border-b border-gray-200">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-gray-900">Item details</h2>
          <p className="text-sm text-gray-500 capitalize mt-1">
            {item.itemType.replace("-", " ")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(item.itemData?.url || item.itemData?.embedUrl) && (
            <Button
              variant="ghost"
              onClick={handleExternalOpen}
              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              title="Open in new tab"
            >
              <ExternalLink size={18} />
            </Button>
          )}
          {(item.itemData?.content || item.itemData?.text) && (
            <Button
              variant="ghost"
              onClick={() =>
                handleCopy(item.itemData.content || item.itemData.text)
              }
              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              title="Copy content"
            >
              <Copy size={18} />
            </Button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="text-base font-semibold text-gray-900">
            {item.itemData?.title || `${item.itemType} item`}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 border border-gray-200">
              {item.itemType.replace("-", " ").toUpperCase()}
            </span>
            {item.createdAt && (
              <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-gray-50 border border-gray-200">
                <Calendar size={14} />
                Added {formatDateTime(item.createdAt)}
              </span>
            )}
          </div>
        </div>

        {/* URL Section */}
        {(item.itemData?.url || item.itemData?.embedUrl) && (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source URL
            </label>
            <div className="flex items-start justify-between gap-3 rounded-lg bg-gray-50 border border-gray-200 p-3">
              <a
                href={item.itemData.url || item.itemData.embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 break-all text-sm"
              >
                {item.itemData.url || item.itemData.embedUrl}
              </a>
              <Button
                variant="ghost"
                onClick={handleExternalOpen}
                className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                title="Open"
              >
                <ExternalLink size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* Content Section */}
        {(item.itemData?.content ||
          item.itemData?.text ||
          item.itemData?.description) && (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 max-h-80 overflow-y-auto">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                {item.itemData.content ||
                  item.itemData.text ||
                  item.itemData.description}
              </p>
            </div>
          </div>
        )}

        {/* YouTube specific fields */}
        {item.itemType === "youtube" && (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              YouTube
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {item.itemData?.channelTitle && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Channel
                  </label>
                  <p className="text-sm text-gray-900">
                    {item.itemData.channelTitle}
                  </p>
                </div>
              )}

              {item.itemData?.duration && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Duration
                  </label>
                  <p className="text-sm text-gray-900">
                    {item.itemData.duration}
                  </p>
                </div>
              )}

              {item.itemData?.viewCount && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Views
                  </label>
                  <p className="text-sm text-gray-900">
                    {item.itemData.viewCount.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Todo specific fields */}
        {item.itemType === "todo" && (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Todo</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Status
                </label>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-md text-sm font-medium ${
                    item.itemData?.completed
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                  }`}
                >
                  {item.itemData?.completed ? "Completed" : "Pending"}
                </span>
              </div>

              {item.itemData?.priority && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Priority
                  </label>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-md text-sm font-medium capitalize ${
                      item.itemData.priority === "high"
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : item.itemData.priority === "medium"
                        ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                        : "bg-blue-100 text-blue-800 border border-blue-200"
                    }`}
                  >
                    {item.itemData.priority}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sticky Note specific fields */}
        {item.itemType === "sticky-note" && item.itemData?.color && (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Note</h4>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Color
              </label>
              <div className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded-lg border border-gray-300"
                  style={{ backgroundColor: item.itemData.color }}
                />
                <span className="text-gray-900 font-medium font-mono">
                  {item.itemData.color}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
