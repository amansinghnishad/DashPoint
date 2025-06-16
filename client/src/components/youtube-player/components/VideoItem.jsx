import { Play, X, FolderPlus } from "lucide-react";

export const VideoItem = ({
  video,
  onPlay,
  onRemove,
  onAddToCollection,
  isActive,
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border ${
        isActive ? "border-blue-500" : "border-gray-200"
      } p-3`}
    >
      <div className="flex space-x-3">
        <div className="relative">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-20 h-14 object-cover rounded cursor-pointer"
            onClick={() => onPlay(video)}
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded">
            <Play size={16} className="text-white" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className="font-medium text-sm text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600"
            onClick={() => onPlay(video)}
          >
            {video.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {video.channelTitle && (
              <span className="mr-2">{video.channelTitle}</span>
            )}
            {video.duration && <span className="mr-2">• {video.duration}</span>}
            {video.viewCount && (
              <span>• {video.viewCount.toLocaleString()} views</span>
            )}
          </p>
        </div>

        <div className="flex flex-col space-y-1">
          <button
            onClick={() => onAddToCollection(video)}
            className="text-gray-400 hover:text-blue-500 p-1"
            title="Add to collection"
          >
            <FolderPlus size={16} />
          </button>
          <button
            onClick={() => onRemove(video._id)}
            className="text-gray-400 hover:text-red-500 p-1"
            title="Remove"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
