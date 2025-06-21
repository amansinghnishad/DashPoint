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

  const getItemIcon = () => {
    switch (item.itemType) {
      case "youtube":
        return "🎥";
      case "content":
        return "📄";
      case "sticky-note":
        return "📝";
      case "todo":
        return "✅";
      default:
        return "📋";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-3xl"
      showCloseButton={false}
    >
      <div className="flex justify-between items-center p-6 border-b border-gray-200/50">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center text-2xl">
            {getItemIcon()}
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
              Item Details
            </h2>
            <p className="text-gray-600 capitalize">
              {item.itemType.replace("-", " ")} • Collection Item
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {(item.itemData?.url || item.itemData?.embedUrl) && (
            <Button
              variant="ghost"
              onClick={handleExternalOpen}
              className="p-3 text-gray-500 hover:text-green-600 hover:bg-green-50"
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
              className="p-3 text-gray-500 hover:text-purple-600 hover:bg-purple-50"
              title="Copy content"
            >
              <Copy size={18} />
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={onClose}
            className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            ✕
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Header Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {item.itemData?.title || `${item.itemType} Item`}
          </h3>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center px-3 py-1 bg-white/80 rounded-lg border border-blue-200">
              {item.itemType.replace("-", " ").toUpperCase()}
            </span>
            {item.createdAt && (
              <span className="flex items-center space-x-2 px-3 py-1 bg-white/80 rounded-lg border border-blue-200">
                <Calendar size={14} />
                <span>Added {formatDateTime(item.createdAt)}</span>
              </span>
            )}
          </div>
        </div>

        {/* URL Section */}
        {(item.itemData?.url || item.itemData?.embedUrl) && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              🔗 Source URL
            </label>
            <div className="flex items-center justify-between bg-gray-50/80 rounded-xl p-4">
              <a
                href={item.itemData.url || item.itemData.embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 break-all font-medium"
              >
                {item.itemData.url || item.itemData.embedUrl}
              </a>
              <Button
                variant="ghost"
                onClick={handleExternalOpen}
                className="ml-3 p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
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
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              📝 Content
            </label>
            <div className="bg-gray-50/80 rounded-xl p-4 max-h-80 overflow-y-auto">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {item.itemData.content ||
                  item.itemData.text ||
                  item.itemData.description}
              </p>
            </div>
          </div>
        )}

        {/* YouTube specific fields */}
        {item.itemType === "youtube" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              🎥 YouTube Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {item.itemData?.channelTitle && (
                <div className="bg-red-50/80 rounded-xl p-4 border border-red-200">
                  <label className="block text-sm font-bold text-red-700 mb-1">
                    Channel
                  </label>
                  <p className="text-gray-900 font-medium">
                    {item.itemData.channelTitle}
                  </p>
                </div>
              )}

              {item.itemData?.duration && (
                <div className="bg-red-50/80 rounded-xl p-4 border border-red-200">
                  <label className="block text-sm font-bold text-red-700 mb-1">
                    Duration
                  </label>
                  <p className="text-gray-900 font-medium">
                    {item.itemData.duration}
                  </p>
                </div>
              )}

              {item.itemData?.viewCount && (
                <div className="bg-red-50/80 rounded-xl p-4 border border-red-200">
                  <label className="block text-sm font-bold text-red-700 mb-1">
                    Views
                  </label>
                  <p className="text-gray-900 font-medium">
                    {item.itemData.viewCount.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Todo specific fields */}
        {item.itemType === "todo" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              ✅ Todo Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50/80 rounded-xl p-4 border border-green-200">
                <label className="block text-sm font-bold text-green-700 mb-2">
                  Status
                </label>
                <span
                  className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                    item.itemData?.completed
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : "bg-yellow-100 text-yellow-800 border border-yellow-300"
                  }`}
                >
                  {item.itemData?.completed ? "✅ Completed" : "⏳ Pending"}
                </span>
              </div>

              {item.itemData?.priority && (
                <div className="bg-green-50/80 rounded-xl p-4 border border-green-200">
                  <label className="block text-sm font-bold text-green-700 mb-2">
                    Priority
                  </label>
                  <span
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium capitalize ${
                      item.itemData.priority === "high"
                        ? "bg-red-100 text-red-800 border border-red-300"
                        : item.itemData.priority === "medium"
                        ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                        : "bg-blue-100 text-blue-800 border border-blue-300"
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
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              📝 Note Details
            </h4>
            <div className="bg-yellow-50/80 rounded-xl p-4 border border-yellow-200">
              <label className="block text-sm font-bold text-yellow-700 mb-2">
                Color
              </label>
              <div className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded-lg border-2 border-gray-300 shadow-sm"
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
