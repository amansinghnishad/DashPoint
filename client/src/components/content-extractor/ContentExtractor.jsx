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

  return (
    <div className="content-extractor max-w-6xl mx-auto p-4">
      <ContentExtractorForm
        url={url}
        setUrl={setUrl}
        loading={loading}
        error={error}
        onExtract={extractContent}
        onKeyPress={handleKeyPress}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ContentList
          extractedContents={extractedContents}
          selectedContent={selectedContent}
          onSelectContent={setSelectedContent}
          onDeleteContent={deleteContent}
          onAddToCollection={handleAddToCollection}
        />

        <ContentViewer
          selectedContent={selectedContent}
          onExportContent={exportContentAsJson}
        />
      </div>

      <UsageTips />

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
