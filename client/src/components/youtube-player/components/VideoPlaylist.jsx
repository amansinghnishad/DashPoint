import { VideoItem } from "./VideoItem";

export const VideoPlaylist = ({
  savedVideos,
  currentVideo,
  onPlayVideo,
  onRemoveVideo,
  onAddToCollection,
  loadingVideos,
}) => {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-4">
        Playlist ({savedVideos.length})
      </h3>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loadingVideos ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : savedVideos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No videos in playlist</p>
            <p className="text-xs mt-1">
              Add YouTube URLs to build your playlist
            </p>
          </div>
        ) : (
          savedVideos.map((video) => (
            <VideoItem
              key={video._id || video.id}
              video={video}
              onPlay={onPlayVideo}
              onRemove={onRemoveVideo}
              onAddToCollection={onAddToCollection}
              isActive={
                currentVideo?._id === video._id || currentVideo?.id === video.id
              }
            />
          ))
        )}
      </div>
    </div>
  );
};
