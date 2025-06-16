import { BookOpen } from "lucide-react";
import { ContentItem } from "./ContentItem";

export const ContentList = ({
  extractedContents,
  selectedContent,
  onSelectContent,
  onDeleteContent,
  onAddToCollection,
}) => {
  return (
    <div className="lg:col-span-1">
      <h3 className="font-semibold text-lg mb-4">
        Extracted Content ({extractedContents.length})
      </h3>
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
  );
};
