import { useState, useEffect } from "react";
import { contentAPI, enhancedContentAPI } from "../../services/api";
import { AddToCollectionModal } from "../add-to-collection-modal/AddToCollectionModal";
import { useToast } from "../../hooks/useToast";
import { useDashboard } from "../../context/DashboardContext";
import { ContentExtractorForm } from "./components/ContentExtractorForm";
import { ContentList } from "./components/ContentList";
import { ContentViewer } from "./components/ContentViewer";
import { UsageTips } from "./components/UsageTips";
import { AISummaryOptions } from "./components/AISummaryOptions";
import {
  extractContentFromUrl,
  extractContentWithSummary,
  generateContentSummary,
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
  const [generateAISummary, setGenerateAISummary] = useState(false);
  const [summaryLength, setSummaryLength] = useState("medium");
  const [extractImages, setExtractImages] = useState(false);
  const [extractLinks, setExtractLinks] = useState(false);
  const [maxContentLength, setMaxContentLength] = useState(10000);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const { success, error: showError } = useToast();
  const { loadStats } = useDashboard();
  useEffect(() => {
    loadExtractedContents();
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

  const extractContent = async () => {
    setError("");
    setLoading(true);

    try {
      let extractedContent;

      if (generateAISummary) {
        // Use enhanced extraction with AI summarization
        extractedContent = await extractContentWithSummary(url, {
          extractImages,
          extractLinks,
          maxContentLength,
          generateSummary: generateAISummary,
          summaryLength,
        });
      } else {
        // Use standard extraction
        const result = await extractContentFromUrl(url, extractedContents);
        extractedContent = result.content;
      }

      // Check if content already exists
      if (extractedContent.existing) {
        setSelectedContent(extractedContent.content);
        success("Content already extracted - showing cached version");
        return;
      }

      // Add to extracted contents list
      setExtractedContents((prev) => [extractedContent, ...prev]);
      setSelectedContent(extractedContent);
      setUrl("");

      const successMessage = generateAISummary
        ? "Content extracted with AI summary successfully"
        : "Content extracted successfully";
      success(successMessage);

      // Refresh dashboard stats
      loadStats();
    } catch (err) {
      console.error("Content extraction error:", err);
      setError(err.message || "Failed to extract content");
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async (content) => {
    setLoadingSummary(true);
    try {
      const summary = await generateContentSummary(
        content.content,
        summaryLength
      );

      // Update the content in the extractedContents array
      setExtractedContents((prev) =>
        prev.map((c) =>
          c._id === content._id
            ? { ...c, aiSummary: summary, summaryGenerated: true }
            : c
        )
      );

      // Update selected content if it's the same
      if (selectedContent?._id === content._id) {
        setSelectedContent((prev) => ({
          ...prev,
          aiSummary: summary,
          summaryGenerated: true,
        }));
      }

      success("AI summary generated successfully");
    } catch (err) {
      console.error("Failed to generate summary:", err);
      showError(err.message || "Failed to generate AI summary");
    } finally {
      setLoadingSummary(false);
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      extractContent();
    }
  };

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
        // Refresh dashboard stats
        loadStats();
        // Refresh dashboard stats
        loadStats();
      }
    } catch (err) {
      console.error("Failed to delete content:", err);
      showError("Failed to delete content");
    }
  };

  const handleAddToCollection = (content) => {
    setContentToAdd(content);
    setShowAddToCollection(true);
  };

  const handleShowTips = () => {
    setShowTips(true);
    localStorage.setItem("contentExtractorTipsVisible", JSON.stringify(true));
  };

  const handleContentUpdate = async (contentId, newContent) => {
    try {
      const response = await contentAPI.update(contentId, {
        content: newContent,
        text: newContent,
      });

      if (response.success) {
        setExtractedContents((prev) =>
          prev.map((content) =>
            content._id === contentId
              ? { ...content, content: newContent, text: newContent }
              : content
          )
        );

        if (selectedContent && selectedContent._id === contentId) {
          setSelectedContent((prev) => ({
            ...prev,
            content: newContent,
            text: newContent,
          }));
        }
        success("Content updated successfully");
      }
    } catch (err) {
      console.error("❌ Failed to update content:", err);
      showError("Failed to save content changes");
    }
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
        <AISummaryOptions
          generateAISummary={generateAISummary}
          setGenerateAISummary={setGenerateAISummary}
          summaryLength={summaryLength}
          setSummaryLength={setSummaryLength}
          extractImages={extractImages}
          setExtractImages={setExtractImages}
          extractLinks={extractLinks}
          setExtractLinks={setExtractLinks}
          maxContentLength={maxContentLength}
          setMaxContentLength={setMaxContentLength}
        />
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 mt-8">
          {" "}
          <div className="xl:col-span-8 order-1">
            <ContentViewer
              selectedContent={selectedContent}
              onExportContent={exportContentAsJson}
              onContentUpdate={handleContentUpdate}
            />
          </div>
          <div className="xl:col-span-4 order-2">
            <ContentList
              extractedContents={extractedContents}
              selectedContent={selectedContent}
              onSelectContent={setSelectedContent}
              onDeleteContent={deleteContent}
              onAddToCollection={handleAddToCollection}
              loading={loadingContents}
            />
          </div>
        </div>
        <div className="mt-8">
          <UsageTips isVisible={showTips} onVisibilityChange={setShowTips} />
        </div>{" "}
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
