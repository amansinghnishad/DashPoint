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
    <div className="youtube-player min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
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
        />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6">
          <div className="xl:col-span-8">
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

          <div className="xl:col-span-4">
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
