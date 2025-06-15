import { useState, useEffect } from "react";
import {
  Search,
  ExternalLink,
  Copy,
  Download,
  BookOpen,
  Clock,
  Globe,
  Trash2,
  FolderPlus,
} from "lucide-react";
import { validateUrl, cleanUrl, getDomainFromUrl } from "../utils/urlUtils";
import { copyToClipboard, truncateText } from "../utils/helpers";
import { formatDateTime } from "../utils/dateUtils";
import { contentAPI } from "../services/api";
import { AddToCollectionModal } from "./AddToCollectionModal";
import { useToast } from "../hooks/useToast";

const ContentItem = ({
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
        </div>{" "}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            {formatDateTime(content.extractedAt)}
          </span>{" "}
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

export const ContentExtractor = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedContent, setSelectedContent] = useState(null);
  const [extractedContents, setExtractedContents] = useState([]);
  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [contentToAdd, setContentToAdd] = useState(null);
  const [loadingContents, setLoadingContents] = useState(true);
  const { success, error: showError } = useToast();

  // Load existing content on component mount
  useEffect(() => {
    loadExtractedContents();
  }, []);

  const loadExtractedContents = async () => {
    try {
      setLoadingContents(true);
      const response = await contentAPI.getAll();
      if (response.success) {
        setExtractedContents(response.data);
      }
    } catch (err) {
      console.error("Failed to load extracted contents:", err);
      showError("Failed to load saved content");
    } finally {
      setLoadingContents(false);
    }
  };
  // extractContent function
  const extractContent = async () => {
    setError("");
    setLoading(true);

    try {
      if (!url.trim()) {
        throw new Error("Please enter a URL");
      }

      if (!validateUrl(url)) {
        throw new Error("Please enter a valid URL");
      }

      const cleanedUrl = cleanUrl(url);

      // Check if content already extracted
      const existing = extractedContents.find(
        (content) => content.url === cleanedUrl
      );
      if (existing) {
        setSelectedContent(existing);
        setLoading(false);
        return;
      }

      // Call the backend API for content extraction
      const response = await contentAPI.extractContent(cleanedUrl);
      const extractedContent = response.data;

      // Process the extracted content
      const processedContent = {
        url: cleanedUrl,
        title:
          extractedContent.title ||
          `Content from ${getDomainFromUrl(cleanedUrl)}`,
        content: extractedContent.text || extractedContent.content,
        wordCount:
          extractedContent.wordCount ||
          extractedContent.text?.split(" ").length ||
          0,
        domain: getDomainFromUrl(cleanedUrl),
        category: extractedContent.category || "general",
      };

      // Save to database
      const saveResponse = await contentAPI.create(processedContent);
      if (saveResponse.success) {
        const savedContent = saveResponse.data;
        setExtractedContents((prev) => [savedContent, ...prev]);
        setSelectedContent(savedContent);
        success("Content extracted and saved successfully");
      }

      setUrl("");
    } catch (err) {
      console.error("Content extraction error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to extract content"
      );
    } finally {
      setLoading(false);
    }
  };

  // handleKeyPress function
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      extractContent();
    }
  };
  // deleteContent function
  const deleteContent = async (contentId) => {
    try {
      const response = await contentAPI.delete(contentId);
      if (response.success) {
        setExtractedContents((prev) =>
          prev.filter((content) => content._id !== contentId)
        );

        // If the deleted content was selected, clear the selection
        if (selectedContent && selectedContent._id === contentId) {
          setSelectedContent(null);
        }

        success("Content deleted successfully");
      }
    } catch (err) {
      console.error("Failed to delete content:", err);
      showError("Failed to delete content");
    }
  };

  // handleAddToCollection function
  const handleAddToCollection = (content) => {
    setContentToAdd(content);
    setShowAddToCollection(true);
  };

  // exportContent function
  const exportContent = (content) => {
    const dataStr = JSON.stringify(content, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `content-${content.domain}-${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="content-extractor max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Content Extractor
        </h2>

        {/* URL Input */}
        <div className="flex space-x-2 mb-4">
          <div className="flex-1 relative">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter website URL to extract content..."
              className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <Globe
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
          <button
            onClick={extractContent}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium flex items-center space-x-2"
          >
            <Search size={20} />
            <span>{loading ? "Extracting..." : "Extract"}</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading && (
          <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
            Extracting content from the webpage... This may take a few seconds.
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content List */}
        <div className="lg:col-span-1">
          <h3 className="font-semibold text-lg mb-4">
            Extracted Content ({extractedContents.length})
          </h3>{" "}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {extractedContents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-sm">No content extracted yet</p>
                <p className="text-xs mt-1">Enter a URL to extract content</p>
              </div>
            ) : (
              extractedContents.map((content) => (
                <ContentItem
                  key={content._id || content.id}
                  content={content}
                  onSelect={setSelectedContent}
                  isSelected={
                    selectedContent?._id === content._id ||
                    selectedContent?.id === content.id
                  }
                  onDelete={deleteContent}
                  onAddToCollection={handleAddToCollection}
                />
              ))
            )}
          </div>
        </div>

        {/* Content Viewer */}
        <div className="lg:col-span-2">
          {selectedContent ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedContent.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Globe size={14} />
                      <span>{selectedContent.domain}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <BookOpen size={14} />
                      <span>{selectedContent.wordCount} words</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>
                        {Math.ceil(selectedContent.wordCount / 200)} min read
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(selectedContent.text)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center space-x-1"
                    title="Copy content"
                  >
                    <Copy size={14} />
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={() => exportContent(selectedContent)}
                    className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded flex items-center space-x-1"
                    title="Export content"
                  >
                    <Download size={14} />
                    <span>Export</span>
                  </button>
                  <a
                    href={selectedContent.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded flex items-center space-x-1"
                    title="Open original"
                  >
                    <ExternalLink size={14} />
                    <span>Original</span>
                  </a>
                </div>
              </div>{" "}
              <div className="prose prose-sm max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedContent.content || selectedContent.text}
                </div>
              </div>{" "}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Extracted on{" "}
                  {formatDateTime(
                    selectedContent.createdAt || selectedContent.extractedAt
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-600 mb-2">
                No content selected
              </p>
              <p className="text-sm text-gray-500">
                Extract content from a webpage or select from the list to view
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Usage Tips */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-2">How to use:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Enter any website URL to extract readable content</li>
          <li>• Content is automatically cleaned and formatted</li>
          <li>• Copy extracted text or export as JSON</li>
          <li>• All extracted content is saved locally</li>
          <li>• Click on any item in the list to view full content</li>
        </ul>
      </div>{" "}
      {/* Add to Collection Modal */}
      {showAddToCollection && contentToAdd && (
        <AddToCollectionModal
          isOpen={showAddToCollection}
          onClose={() => {
            setShowAddToCollection(false);
            setContentToAdd(null);
          }}
          itemType="content"
          itemId={contentToAdd._id || contentToAdd.id}
          itemTitle={contentToAdd.title}
        />
      )}
    </div>
  );
};
