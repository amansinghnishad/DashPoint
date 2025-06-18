import { useState, useEffect } from "react";
import { contentAPI } from "../../services/api";
import { AddToCollectionModal } from "../add-to-collection-modal/AddToCollectionModal";
import { useToast } from "../../hooks/useToast";
import { ContentExtractorForm } from "./components/ContentExtractorForm";
import { ContentList } from "./components/ContentList";
import { ContentViewer } from "./components/ContentViewer";
import { UsageTips } from "./components/UsageTips";
import {
  extractContentFromUrl,
  exportContentAsJson,
} from "./utils/contentExtractorHelpers";
import "./content-extractor.css";

export const ContentExtractor = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedContent, setSelectedContent] = useState(null);
  const [extractedContents, setExtractedContents] = useState([]);
  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [contentToAdd, setContentToAdd] = useState(null);
  const [loadingContents, setLoadingContents] = useState(true);
  const [showTips, setShowTips] = useState(true);
  const { success, error: showError } = useToast();

  // Load existing content on component mount
  useEffect(() => {
    loadExtractedContents();
    // Check if tips should be shown
    const savedVisibility = localStorage.getItem("contentExtractorTipsVisible");
    if (savedVisibility !== null) {
      setShowTips(JSON.parse(savedVisibility));
    }
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
      const result = await extractContentFromUrl(url, extractedContents);

      if (result.existing) {
        setSelectedContent(result.content);
      } else {
        setExtractedContents((prev) => [result.content, ...prev]);
        setSelectedContent(result.content);
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

  // handleShowTips function
  const handleShowTips = () => {
    setShowTips(true);
    localStorage.setItem("contentExtractorTipsVisible", JSON.stringify(true));
  };

  return (
    <div className="content-extractor min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ContentExtractorForm
          url={url}
          setUrl={setUrl}
          loading={loading}
          error={error}
          onExtract={extractContent}
          onKeyPress={handleKeyPress}
        />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8">
          <ContentList
            extractedContents={extractedContents}
            selectedContent={selectedContent}
            onSelectContent={setSelectedContent}
            onDeleteContent={deleteContent}
            onAddToCollection={handleAddToCollection}
            loading={loadingContents}
          />

          <ContentViewer
            selectedContent={selectedContent}
            onExportContent={exportContentAsJson}
          />
        </div>
        <UsageTips isVisible={showTips} onVisibilityChange={setShowTips} />{" "}
        {/* Show Tips Button - appears when tips are hidden */}
        {!showTips && (
          <div className="mt-8 max-w-6xl mx-auto text-center">
            <button
              onClick={handleShowTips}
              className="show-tips-btn inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              Show Usage Tips
            </button>
          </div>
        )}
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
    </div>
  );
};
