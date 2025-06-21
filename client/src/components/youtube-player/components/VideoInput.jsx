import { Youtube, Search, Sparkles } from "lucide-react";
import { Input, Button, ErrorDisplay } from "../../ui";

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
    <div className="relative">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-600 to-pink-600 rounded-full mb-4 shadow-lg">
          <Youtube className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-red-800 to-pink-800 bg-clip-text text-transparent mb-2">
          YouTube Player
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Build your personal YouTube playlist with seamless video management
        </p>
      </div>

      {/* URL Input Section */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 backdrop-blur-sm">
          {" "}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Paste YouTube URL here (e.g., https://youtube.com/watch?v=...)"
                icon={<Youtube size={20} />}
                disabled={loading}
              />
            </div>
            <Button
              onClick={onAddVideo}
              disabled={loading || !videoUrl.trim()}
              loading={loading}
              variant="primary"
              size="lg"
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
            >
              {loading ? (
                "Adding Video..."
              ) : (
                <>
                  <Search size={20} />
                  Add to Playlist
                </>
              )}
            </Button>
          </div>
          <ErrorDisplay error={error} />
        </div>
      </div>
    </div>
  );
};
