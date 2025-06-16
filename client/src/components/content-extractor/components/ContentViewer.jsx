import {
  Copy,
  Download,
  ExternalLink,
  Globe,
  BookOpen,
  Clock,
} from "lucide-react";
import { copyToClipboard } from "../../../utils/helpers";
import { formatDateTime } from "../../../utils/dateUtils";

export const ContentViewer = ({ selectedContent, onExportContent }) => {
  if (!selectedContent) {
    return (
      <div className="lg:col-span-2">
        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-600 mb-2">
            No content selected
          </p>
          <p className="text-sm text-gray-500">
            Extract content from a webpage or select from the list to view
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2">
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
              onClick={() => onExportContent(selectedContent)}
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
        </div>

        <div className="prose prose-sm max-w-none">
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {selectedContent.content || selectedContent.text}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Extracted on{" "}
            {formatDateTime(
              selectedContent.createdAt || selectedContent.extractedAt
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
