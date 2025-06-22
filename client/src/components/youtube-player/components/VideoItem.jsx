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
      className={`bg-white/70 backdrop-blur-sm border rounded-xl p-4 transition-all duration-300 hover:bg-white/90 hover:shadow-lg cursor-pointer group ${
        isActive
          ? " border-red-200 shadow-md"
          : "border-gray-200 hover:border-red-200"
      }`}
    >
      <div className="flex space-x-4">
        <div
          className="relative w-24 h-14 flex-shrink-0 rounded-lg overflow-hidden"
          onClick={() => onPlay(video)}
        >
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Play size={18} className="text-white drop-shadow-lg" />
          </div>
          {isActive && (
            <div className="absolute inset-0 bg-red-500/20 border-2 border-red-500 rounded-lg"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2 cursor-pointer hover:text-red-600 transition-colors duration-200 leading-tight"
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
              <div className="flex items-center space-x-1 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 px-2 py-1 rounded-full">
                <Sparkles size={10} />
                <span className="text-xs font-medium">AI Summary</span>
              </div>
            )}
          </div>
        </div>{" "}
        <div className="flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
                className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-all duration-200"
                title="Generate AI summary"
              >
                <Brain size={16} />
              </button>
            )}

          {/* Loading state for summary generation */}
          {video.generatingSummary && (
            <div className="p-2 text-purple-500 bg-purple-50 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-300 border-t-purple-600"></div>
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCollection(video);
            }}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
            title="Add to collection"
          >
            <FolderPlus size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(video._id);
            }}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
            title="Remove from playlist"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
