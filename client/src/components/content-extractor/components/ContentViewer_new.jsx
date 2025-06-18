import {
  Copy,
  Download,
  ExternalLink,
  Globe,
  BookOpen,
  Clock,
  Eye,
  Calendar,
  Check,
  Sparkles,
  Tag,
  Brain,
} from "lucide-react";
import { useState } from "react";
import { copyToClipboard } from "../../../utils/helpers";
import { formatDateTime } from "../../../utils/dateUtils";

export const ContentViewer = ({ selectedContent, onExportContent }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(
      selectedContent.text || selectedContent.content
    );
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "text-green-600 bg-green-50";
      case "negative":
        return "text-red-600 bg-red-50";
      case "neutral":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "😊";
      case "negative":
        return "😔";
      case "neutral":
        return "😐";
      default:
        return "🤖";
    }
  };

  if (!selectedContent) {
    return (
      <div className="xl:col-span-2">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center h-full flex items-center justify-center">
          <div>
            <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Eye size={40} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Select content to view
            </h3>
            <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
              Extract content from a webpage or select an item from your saved
              content to view the full text, AI summary, and analysis.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="xl:col-span-2">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-5 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-2xl font-bold text-gray-900 leading-tight flex-1">
                  {selectedContent.title}
                </h3>
                {selectedContent.aiEnhanced && (
                  <div className="ml-3 flex items-center space-x-1 bg-gradient-to-r from-purple-100 to-blue-100 px-3 py-1 rounded-full">
                    <Sparkles size={14} className="text-purple-600" />
                    <span className="text-xs font-medium text-purple-700">
                      AI Enhanced
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <Globe size={12} className="text-white" />
                  </div>
                  <span className="font-medium">{selectedContent.domain}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen size={16} className="text-gray-400" />
                  <span>{selectedContent.wordCount} words</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock size={16} className="text-gray-400" />
                  <span>
                    {Math.ceil(selectedContent.wordCount / 200)} min read
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span>
                    {formatDateTime(
                      selectedContent.extractedAt || selectedContent.createdAt
                    )}
                  </span>
                </div>
                {selectedContent.sentiment && (
                  <div
                    className={`flex items-center space-x-2 px-2 py-1 rounded-md ${getSentimentColor(
                      selectedContent.sentiment
                    )}`}
                  >
                    <span>{getSentimentIcon(selectedContent.sentiment)}</span>
                    <span className="font-medium capitalize">
                      {selectedContent.sentiment}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 hover:shadow-md"
                title="Copy content"
              >
                {copied ? (
                  <Check size={16} className="text-green-500" />
                ) : (
                  <Copy size={16} />
                )}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
              <button
                onClick={() => onExportContent(selectedContent)}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 hover:shadow-md"
                title="Export content"
              >
                <Download size={16} />
                <span>Export</span>
              </button>
              <a
                href={selectedContent.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 hover:shadow-md"
                title="Open original"
              >
                <ExternalLink size={16} />
                <span>Original</span>
              </a>
            </div>
          </div>
        </div>

        {/* AI Summary & Keywords */}
        {(selectedContent.summary || selectedContent.keywords) && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
            {selectedContent.summary && (
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain size={16} className="text-blue-600" />
                  <h4 className="font-semibold text-gray-900">AI Summary</h4>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    {selectedContent.extractionMethod || "AI-powered"}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm bg-white/50 p-3 rounded-lg">
                  {selectedContent.summary}
                </p>
              </div>
            )}

            {selectedContent.keywords &&
              selectedContent.keywords.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Tag size={16} className="text-indigo-600" />
                    <h4 className="font-semibold text-gray-900">Key Topics</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedContent.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="bg-white/70 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-200 hover:bg-indigo-50 transition-colors duration-200"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <div className="prose prose-gray max-w-none">
            <div className="text-gray-800 leading-relaxed text-base whitespace-pre-wrap font-medium">
              {selectedContent.content || selectedContent.text}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <span className="font-medium">Extracted:</span>{" "}
                {formatDateTime(
                  selectedContent.createdAt || selectedContent.extractedAt
                )}
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="text-sm text-gray-500">
                <span className="font-medium">Source:</span>{" "}
                {selectedContent.domain}
              </div>
              {selectedContent.aiProvider && (
                <>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Enhanced by:</span>{" "}
                    {selectedContent.aiProvider}
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-500">Saved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
