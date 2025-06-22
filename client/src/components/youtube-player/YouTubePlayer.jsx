import { useState, useRef, useEffect } from "react";
import { AddToCollectionModal } from "../add-to-collection-modal/AddToCollectionModal";
import { useToast } from "../../hooks/useToast";
import { useDashboard } from "../../context/DashboardContext";
import { VideoInput } from "./components/VideoInput";
import { VideoPlayer } from "./components/VideoPlayer";
import { VideoPlaylist } from "./components/VideoPlaylist";
import {
  addVideoToPlaylist,
  loadSavedVideos,
  removeVideoFromPlaylist,
  generateVideoSummary,
} from "./utils/youtubeHelpers";
import "./youtube.css";

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
  const [generateAISummary, setGenerateAISummary] = useState(false);
  const [summaryLength, setSummaryLength] = useState("medium");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const playerRef = useRef(null);
  const { success, error: showError } = useToast();
  const { loadStats } = useDashboard();

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
      const savedVideo = await addVideoToPlaylist(
        videoUrl,
        savedVideos,
        generateAISummary,
        summaryLength
      );
      setSavedVideos((prev) => [savedVideo, ...prev]);
      setVideoUrl("");

      // Auto-play the newly added video if no video is currently playing
      if (!currentVideo) {
        setCurrentVideo(savedVideo);
      }

      const successMessage = generateAISummary
        ? "Video added to playlist with AI summary successfully"
        : "Video added to playlist successfully";
      success(successMessage);

      // Refresh dashboard stats
      loadStats();
    } catch (err) {
      console.error("Add video error:", err);
      setError(err.message || "Failed to add video");
    } finally {
      setLoading(false);
    }
  };
  const generateSummary = async (video) => {
    setLoadingSummary(true);

    // Set generating state for this specific video
    setSavedVideos((prev) =>
      prev.map((v) =>
        v._id === video._id ? { ...v, generatingSummary: true } : v
      )
    );

    try {
      const summary = await generateVideoSummary(video.url, summaryLength);

      // Update the video in the savedVideos array
      setSavedVideos((prev) =>
        prev.map((v) =>
          v._id === video._id
            ? {
                ...v,
                aiSummary: summary,
                summaryGenerated: true,
                generatingSummary: false,
              }
            : v
        )
      );

      // Update current video if it's the same
      if (currentVideo?._id === video._id) {
        setCurrentVideo((prev) => ({
          ...prev,
          aiSummary: summary,
          summaryGenerated: true,
          generatingSummary: false,
        }));
      }

      success("AI summary generated successfully");
    } catch (err) {
      console.error("Failed to generate summary:", err);
      // Clear generating state on error
      setSavedVideos((prev) =>
        prev.map((v) =>
          v._id === video._id ? { ...v, generatingSummary: false } : v
        )
      );
      showError(err.message || "Failed to generate AI summary");
    } finally {
      setLoadingSummary(false);
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
      // Refresh dashboard stats
      loadStats();
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
    <div className="youtube-player min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {" "}
        {/* Header Section */}
        <VideoInput
          videoUrl={videoUrl}
          setVideoUrl={setVideoUrl}
          onAddVideo={addVideo}
          loading={loading}
          error={error}
          generateAISummary={generateAISummary}
          setGenerateAISummary={setGenerateAISummary}
          summaryLength={summaryLength}
          setSummaryLength={setSummaryLength}
        />{" "}
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 mt-8">
          {/* Video Player - Takes up more space */}
          <div className="xl:col-span-8 order-1 xl:order-1">
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

          {/* Playlist - Sidebar */}
          <div className="xl:col-span-4 order-2 xl:order-2">
            {" "}
            <VideoPlaylist
              savedVideos={savedVideos}
              currentVideo={currentVideo}
              onPlayVideo={playVideo}
              onRemoveVideo={removeVideo}
              onAddToCollection={handleAddToCollection}
              onGenerateSummary={generateSummary}
              loadingVideos={loadingVideos}
            />
          </div>
        </div>
        {/* Usage Tips - Full Width */}
        <div className="mt-8">
          <div className="glass-effect rounded-2xl p-8 shadow-xl">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-center mb-6">
                <h3 className="text-2xl font-bold gradient-text flex items-center">
                  <svg
                    className="w-6 h-6 mr-3 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Pro Tips & Features
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">
                      Paste any YouTube URL to instantly add videos to your
                      playlist
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">
                      Click on video thumbnails to start playing immediately
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">
                      Use fullscreen mode for an immersive viewing experience
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">
                      Your playlist is automatically saved and synced across
                      sessions
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">
                      Add videos to collections for better organization
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">
                      Create custom playlists for different moods and occasions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
    </div>
  );
};
