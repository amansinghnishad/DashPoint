import { Link, Search } from "lucide-react";

export const VideoInput = ({
  videoUrl,
  setVideoUrl,
  onAddVideo,
  loading,
  error,
}) => {
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onAddVideo();
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">YouTube Player</h2>

      {/* URL Input */}
      <div className="flex space-x-2 mb-4">
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
          onClick={onAddVideo}
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
  );
};
