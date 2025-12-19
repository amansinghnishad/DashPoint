import { Music, Youtube } from "lucide-react";
import { VideoItem } from "./VideoItem";

export const VideoPlaylist = ({
  savedVideos,
  currentVideo,
  onPlayVideo,
  onRemoveVideo,
  onAddToCollection,
  onGenerateSummary,
  loadingVideos,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 h-fit shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center">
          <Music size={16} className="mr-2 text-gray-600" />
          Playlist
        </h3>
        <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
          {savedVideos.length} video{savedVideos.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-3 custom-scrollbar max-h-[600px] xl:max-h-[700px] overflow-y-auto pr-1">
        {loadingVideos ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
          </div>
        ) : savedVideos.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full mb-3">
              <Youtube size={18} className="text-gray-600" />
            </div>
            <p className="font-medium text-gray-900 mb-1">No videos</p>
            <p className="text-sm text-gray-600">Add a URL to get started.</p>
          </div>
        ) : (
          <>
            {savedVideos.map((video, index) => (
              <VideoItem
                key={video._id || video.id || index}
                video={video}
                onPlay={onPlayVideo}
                onRemove={onRemoveVideo}
                onAddToCollection={onAddToCollection}
                onGenerateSummary={onGenerateSummary}
                isActive={
                  currentVideo?._id === video._id ||
                  currentVideo?.id === video.id
                }
              />
            ))}
            {savedVideos.length > 0 && (
              <div className="text-center py-4 border-t border-gray-200 mt-4">
                <p className="text-xs text-gray-500">
                  {savedVideos.length} video
                  {savedVideos.length !== 1 ? "s" : ""} in your playlist
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
