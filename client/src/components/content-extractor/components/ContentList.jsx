import { BookOpen, Folder, Loader2 } from "lucide-react";
import { ContentItem } from "./ContentItem";

export const ContentList = ({
  extractedContents,
  selectedContent,
  onSelectContent,
  onDeleteContent,
  onAddToCollection,
  loading,
}) => {
  return (
    <div className="xl:col-span-1">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 h-fit">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
              <Folder className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Extracted Content
              </h3>
              <p className="text-sm text-gray-500">
                {extractedContents.length} items saved
              </p>
            </div>
          </div>
          <div className="px-3 py-1 bg-gray-100 rounded-full">
            <span className="text-sm font-medium text-gray-600">
              {extractedContents.length}
            </span>
          </div>
        </div>

        {/* Content List */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Loading your content...</p>
              </div>
            </div>
          ) : extractedContents.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen size={32} className="text-gray-400" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                No content yet
              </h4>
              <p className="text-sm text-gray-500 mb-1">
                Extract content from any webpage
              </p>
              <p className="text-xs text-gray-400">
                Enter a URL above to get started
              </p>
            </div>
          ) : (
            extractedContents.map((content) => (
              <ContentItem
                key={content._id || content.id}
                content={content}
                onSelect={onSelectContent}
                isSelected={
                  selectedContent?._id === content._id ||
                  selectedContent?.id === content.id
                }
                onDelete={onDeleteContent}
                onAddToCollection={onAddToCollection}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
