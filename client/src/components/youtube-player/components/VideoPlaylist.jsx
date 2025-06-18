import { Music, Youtube } from "lucide-react";
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
    <div className="glass-effect rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <Music size={20} className="mr-2 text-red-500" />
          Playlist
        </h3>
        <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
          {savedVideos.length} videos
        </span>
      </div>

      <div className="space-y-3 custom-scrollbar max-h-96 overflow-y-auto">
        {loadingVideos ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-3 border-red-200 border-t-red-500 rounded-full animate-spin"></div>
          </div>
        ) : savedVideos.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-100 to-pink-100 rounded-full mb-4">
              <Youtube size={32} className="text-red-500" />
            </div>
            <p className="font-semibold text-gray-900 mb-2">No videos yet</p>
            <p className="text-sm text-gray-500">
              Add YouTube URLs to build your playlist
            </p>
          </div>
        ) : (
          savedVideos.map((video, index) => (
            <VideoItem
              key={video._id || video.id || index}
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
