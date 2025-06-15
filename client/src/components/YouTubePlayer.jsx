import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  X,
  Link,
  Search,
  FolderPlus,
} from "lucide-react";
import {
  extractYouTubeId,
  validateYouTubeUrl,
  getYouTubeThumbnail,
} from "../utils/urlUtils";
import { youtubeAPI } from "../services/api";
import { AddToCollectionModal } from "./AddToCollectionModal";
import { useToast } from "../hooks/useToast";

const VideoItem = ({
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
        </div>{" "}
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
          </p>{" "}
        </div>
        <div className="flex flex-col space-y-1">
          <button
            onClick={() => onAddToCollection(video)}
            className="text-gray-400 hover:text-blue-500 p-1"
            title="Add to collection"
          >
            <FolderPlus size={16} />
          </button>{" "}
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

export const YouTubePlayer = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [savedVideos, setSavedVideos] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [videoToAdd, setVideoToAdd] = useState(null);
  const playerRef = useRef(null);
  const { success, error: showError } = useToast();

  // Load saved videos on component mount
  useEffect(() => {
    loadSavedVideos();
  }, []);

  const loadSavedVideos = async () => {
    try {
      setLoadingVideos(true);
      const response = await youtubeAPI.getAll();
      if (response.success) {
        setSavedVideos(response.data);
      }
    } catch (err) {
      console.error("Failed to load saved videos:", err);
      showError("Failed to load saved videos");
    } finally {
      setLoadingVideos(false);
    }
  };
  // addVideo function
  const addVideo = async () => {
    setError("");
    setLoading(true);

    try {
      if (!videoUrl.trim()) {
        throw new Error("Please enter a YouTube URL");
      }

      if (!validateYouTubeUrl(videoUrl)) {
        throw new Error("Please enter a valid YouTube URL");
      }

      const videoId = extractYouTubeId(videoUrl);
      if (!videoId) {
        throw new Error("Could not extract video ID from URL");
      } // Check if video already exists
      if (savedVideos.some((video) => video.videoId === videoId)) {
        throw new Error("This video is already in your playlist");
      }

      // Fetch video details from YouTube API
      const response = await youtubeAPI.getVideoDetails(videoId);

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch video details");
      }

      const videoData = response.data;

      // Create video object with real API data
      const newVideo = {
        videoId: videoData.id,
        title: videoData.title,
        thumbnail: videoData.thumbnail.medium || videoData.thumbnail.default,
        embedUrl: videoData.embedUrl,
        url: videoData.url,
        duration: videoData.duration,
        channelTitle: videoData.channelTitle,
        viewCount: videoData.viewCount,
      };

      // Save to database
      const saveResponse = await youtubeAPI.create(newVideo);
      if (saveResponse.success) {
        const savedVideo = saveResponse.data;
        setSavedVideos((prev) => [savedVideo, ...prev]);
        setVideoUrl("");

        // Auto-play the newly added video if no video is currently playing
        if (!currentVideo) {
          setCurrentVideo(savedVideo);
        }

        success("Video added to playlist successfully");
      }
    } catch (err) {
      console.error("Add video error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to add video"
      );
    } finally {
      setLoading(false);
    }
  };

  // playVideo function
  const playVideo = (video) => {
    setCurrentVideo(video);
    setIsPlaying(true);
    setError("");
  };
  // removeVideo function
  const removeVideo = async (videoId) => {
    try {
      const response = await youtubeAPI.delete(videoId);
      if (response.success) {
        setSavedVideos((prev) => prev.filter((video) => video._id !== videoId));

        // If the removed video was currently playing, stop playback
        if (currentVideo?._id === videoId) {
          setCurrentVideo(null);
          setIsPlaying(false);
        }

        success("Video removed from playlist");
      }
    } catch (err) {
      console.error("Failed to remove video:", err);
      showError("Failed to remove video");
    }
  };

  // togglePlayPause function
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // toggleFullscreen function
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // handleKeyPress function
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addVideo();
    }
  };

  // handleAddToCollection function
  const handleAddToCollection = (video) => {
    setVideoToAdd(video);
    setShowAddToCollection(true);
  };

  return (
    <div className="youtube-player max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          YouTube Player
        </h2>

        {/* URL Input */}
        <div className="flex space-x-2 mb-4">
          {" "}
          <div className="flex-1 relative">
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Paste YouTube URL here..."
              className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <Link
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
          <button
            onClick={addVideo}
            disabled={loading || !videoUrl.trim()}
            className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <Search size={16} />
                <span>Add Video</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-2">
          {currentVideo ? (
            <div
              className={`relative ${
                isFullscreen ? "fixed inset-0 z-50 bg-black" : ""
              }`}
            >
              <div
                className={`relative ${
                  isFullscreen ? "h-full" : "aspect-video"
                } bg-black rounded-lg overflow-hidden`}
              >
                {" "}
                <iframe
                  ref={playerRef}
                  src={`${currentVideo.embedUrl}?autoplay=${
                    isPlaying ? 1 : 0
                  }&rel=0&modestbranding=1`}
                  title={currentVideo.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
                {/* Custom Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={togglePlayPause}
                        className="hover:bg-white/20 p-2 rounded"
                      >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                      </button>
                      <button className="hover:bg-white/20 p-2 rounded">
                        <Volume2 size={20} />
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={toggleFullscreen}
                        className="hover:bg-white/20 p-2 rounded"
                      >
                        <Maximize size={20} />
                      </button>
                      {isFullscreen && (
                        <button
                          onClick={() => setIsFullscreen(false)}
                          className="hover:bg-white/20 p-2 rounded"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <div
                className={`${
                  isFullscreen ? "absolute bottom-20 left-4 right-4" : "mt-4"
                } text-white`}
              >
                <h3 className="font-semibold text-lg">{currentVideo.title}</h3>
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Play size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">No video selected</p>
                <p className="text-sm">Add a YouTube URL to get started</p>
              </div>
            </div>
          )}
        </div>

        {/* Playlist */}
        <div>
          <h3 className="font-semibold text-lg mb-4">
            Playlist ({savedVideos.length})
          </h3>{" "}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {savedVideos.length === 0 ? (
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
                  onPlay={playVideo}
                  onRemove={removeVideo}
                  onAddToCollection={handleAddToCollection}
                  isActive={
                    currentVideo?._id === video._id ||
                    currentVideo?.id === video.id
                  }
                />
              ))
            )}
          </div>
        </div>
      </div>
      {/* Tips */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Tips:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Paste any YouTube URL to add videos to your playlist</li>
          <li>• Click on video thumbnails to start playing</li>
          <li>• Use fullscreen mode for better viewing experience</li>
          <li>• Your playlist is saved locally in your browser</li>
        </ul>
      </div>{" "}
      {/* Add to Collection Modal */}
      {showAddToCollection && videoToAdd && (
        <AddToCollectionModal
          isOpen={showAddToCollection}
          onClose={() => {
            setShowAddToCollection(false);
            setVideoToAdd(null);
          }}
          itemType="youtube"
          itemId={videoToAdd._id || videoToAdd.id}
          itemTitle={videoToAdd.title}
        />
      )}
    </div>
  );
};
