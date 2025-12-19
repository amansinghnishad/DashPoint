import { Play, X, FolderPlus, Clock, Eye, Sparkles, Brain } from "lucide-react";

export const VideoItem = ({
  video,
  onPlay,
  onRemove,
  onAddToCollection,
  onGenerateSummary,
  isActive,
}) => {
  return (
    <div
      className={`bg-white border rounded-lg p-4 cursor-pointer group hover:bg-gray-50 ${
        isActive ? "border-blue-300 bg-blue-50/20" : "border-gray-200"
      } shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex space-x-4">
        <div
          className="relative w-24 h-14 flex-shrink-0 rounded-lg overflow-hidden"
          onClick={() => onPlay(video)}
        >
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Play size={18} className="text-white" />
          </div>
          {isActive && (
            <div className="absolute inset-0 ring-2 ring-blue-500 rounded-lg"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className="font-medium text-sm text-gray-900 line-clamp-2 mb-2 leading-tight"
            onClick={() => onPlay(video)}
            title={video.title}
          >
            {video.title}
          </h4>
          {video.channelTitle && (
            <p className="text-xs text-gray-600 mb-2 line-clamp-1 font-medium">
              {video.channelTitle}
            </p>
          )}{" "}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              {video.duration && (
                <span className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full">
                  <Clock size={12} />
                  <span>{video.duration}</span>
                </span>
              )}
              {video.viewCount && (
                <span className="flex items-center space-x-1">
                  <Eye size={12} />
                  <span>{video.viewCount.toLocaleString()}</span>
                </span>
              )}
            </div>

            {/* AI Summary Status */}
            {video.summaryGenerated && video.aiSummary && (
              <div className="flex items-center space-x-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                <Sparkles size={10} />
                <span className="text-xs font-medium">Summary</span>
              </div>
            )}
          </div>
        </div>{" "}
        <div className="flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Generate Summary Button - only show if no summary exists yet */}
          {!video.summaryGenerated &&
            !video.aiSummary &&
            !video.generatingSummary && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // This will be handled by parent component
                  onGenerateSummary && onGenerateSummary(video);
                }}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                title="Generate AI summary"
              >
                <Brain size={16} />
              </button>
            )}

          {/* Loading state for summary generation */}
          {video.generatingSummary && (
            <div className="p-2 text-gray-700 bg-gray-100 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-700"></div>
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCollection(video);
            }}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            title="Add to collection"
          >
            <FolderPlus size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(video._id);
            }}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            title="Remove from playlist"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
