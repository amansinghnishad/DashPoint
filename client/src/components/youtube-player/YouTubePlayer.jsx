import { useState, useRef, useEffect } from "react";
import { AddToCollectionModal } from "../add-to-collection-modal/AddToCollectionModal";
import { useToast } from "../../hooks/useToast";
import { VideoInput } from "./components/VideoInput";
import { VideoPlayer } from "./components/VideoPlayer";
import { VideoPlaylist } from "./components/VideoPlaylist";
import {
  addVideoToPlaylist,
  loadSavedVideos,
  removeVideoFromPlaylist,
} from "./utils/youtubeHelpers";

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
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoadingVideos(true);
      const videos = await loadSavedVideos();
      setSavedVideos(videos);
    } catch (err) {
      console.error("Failed to load saved videos:", err);
      showError(err.message || "Failed to load saved videos");
    } finally {
      setLoadingVideos(false);
    }
  };

  const addVideo = async () => {
    setError("");
    setLoading(true);

    try {
      const savedVideo = await addVideoToPlaylist(videoUrl, savedVideos);
      setSavedVideos((prev) => [savedVideo, ...prev]);
      setVideoUrl("");

      // Auto-play the newly added video if no video is currently playing
      if (!currentVideo) {
        setCurrentVideo(savedVideo);
      }

      success("Video added to playlist successfully");
    } catch (err) {
      console.error("Add video error:", err);
      setError(err.message || "Failed to add video");
    } finally {
      setLoading(false);
    }
  };

  const playVideo = (video) => {
    setCurrentVideo(video);
    setIsPlaying(true);
    setError("");
  };

  const removeVideo = async (videoId) => {
    try {
      await removeVideoFromPlaylist(videoId);
      setSavedVideos((prev) => prev.filter((video) => video._id !== videoId));

      // If the removed video was currently playing, stop playback
      if (currentVideo?._id === videoId) {
        setCurrentVideo(null);
        setIsPlaying(false);
      }

      success("Video removed from playlist");
    } catch (err) {
      console.error("Failed to remove video:", err);
      showError(err.message || "Failed to remove video");
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleAddToCollection = (video) => {
    setVideoToAdd(video);
    setShowAddToCollection(true);
  };

  return (
    <div className="youtube-player max-w-4xl mx-auto p-4">
      <VideoInput
        videoUrl={videoUrl}
        setVideoUrl={setVideoUrl}
        onAddVideo={addVideo}
        loading={loading}
        error={error}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <VideoPlayer
            currentVideo={currentVideo}
            isPlaying={isPlaying}
            isFullscreen={isFullscreen}
            onTogglePlayPause={togglePlayPause}
            onToggleFullscreen={toggleFullscreen}
            onExitFullscreen={() => setIsFullscreen(false)}
            playerRef={playerRef}
          />
        </div>

        {/* Playlist */}
        <div>
          <VideoPlaylist
            savedVideos={savedVideos}
            currentVideo={currentVideo}
            onPlayVideo={playVideo}
            onRemoveVideo={removeVideo}
            onAddToCollection={handleAddToCollection}
            loadingVideos={loadingVideos}
          />
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
      </div>

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
