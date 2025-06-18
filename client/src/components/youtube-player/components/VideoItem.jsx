import { Play, X, FolderPlus, Clock, Eye } from "lucide-react";

export const VideoItem = ({
  video,
  onPlay,
  onRemove,
  onAddToCollection,
  isActive,
}) => {
  return (
    <div
      className={`bg-white/60 backdrop-blur-sm border rounded-xl p-3 transition-all duration-300 hover:bg-white/80 hover:shadow-lg hover:scale-[1.02] cursor-pointer group ${
        isActive
          ? "ring-2 ring-red-500 bg-red-50/80 border-red-200"
          : "border-gray-200 hover:border-red-200"
      }`}
    >
      <div className="flex space-x-3">
        <div
          className="relative w-20 h-12 flex-shrink-0 rounded-lg overflow-hidden group-hover:scale-105 transition-transform duration-300"
          onClick={() => onPlay(video)}
        >
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Play size={16} className="text-white" />
          </div>
          {isActive && (
            <div className="absolute inset-0 bg-red-500/20 border-2 border-red-500 rounded-lg"></div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4
            className="font-medium text-sm text-gray-900 line-clamp-2 mb-1 cursor-pointer hover:text-red-600 transition-colors duration-200"
            onClick={() => onPlay(video)}
            title={video.title}
          >
            {video.title}
          </h4>

          {video.channelTitle && (
            <p className="text-xs text-gray-600 mb-2 line-clamp-1">
              {video.channelTitle}
            </p>
          )}

          <div className="flex items-center space-x-3 text-xs text-gray-500">
            {video.duration && (
              <span className="flex items-center space-x-1">
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
        </div>

        <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCollection(video);
            }}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all duration-200"
            title="Add to collection"
          >
            <FolderPlus size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(video._id);
            }}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all duration-200"
            title="Remove from playlist"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
