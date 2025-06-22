import { Youtube, Search, Sparkles, Brain } from "lucide-react";
import { Input, Button, ErrorDisplay } from "../../ui";

export const VideoInput = ({
  videoUrl,
  setVideoUrl,
  onAddVideo,
  loading,
  error,
  generateAISummary,
  setGenerateAISummary,
  summaryLength,
  setSummaryLength,
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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-600 to-pink-600 rounded-full mb-6 shadow-lg">
          <Youtube className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-red-800 to-pink-800 bg-clip-text text-transparent mb-4">
          YouTube Player
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Build your personal YouTube playlist with Universal AI-powered
          summarization and seamless video management
        </p>
        <div className="flex justify-center mt-4">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            <span className="text-sm font-medium text-green-800">
              Universal AI Agent Active
            </span>
          </div>
        </div>
      </div>

      {/* URL Input Section */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 backdrop-blur-sm">
          <div className="flex flex-col gap-6">
            {/* URL Input Row */}
            <div className="flex flex-col lg:flex-row gap-6 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  YouTube Video URL
                </label>
                <Input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Paste YouTube URL here (e.g., https://youtube.com/watch?v=...)"
                  icon={<Youtube size={20} />}
                  disabled={loading}
                  className="h-14 text-base"
                />
              </div>
              <Button
                onClick={onAddVideo}
                disabled={loading || !videoUrl.trim()}
                loading={loading}
                variant="primary"
                size="lg"
                className="h-14 px-10 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 whitespace-nowrap text-base font-semibold"
              >
                {loading ? (
                  "Adding..."
                ) : (
                  <>
                    <Search size={20} className="mr-2" />
                    Add to Playlist
                  </>
                )}
              </Button>
            </div>{" "}
            {/* AI Summary Options */}
            <div className="border-t pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="generateSummary"
                    checked={generateAISummary}
                    onChange={(e) => setGenerateAISummary(e.target.checked)}
                    className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label
                    htmlFor="generateSummary"
                    className="flex items-center text-sm font-medium text-gray-700"
                  >
                    <Sparkles size={16} className="mr-2 text-purple-600" />
                    Generate Universal AI Summary
                  </label>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 ml-2">
                    Enhanced
                  </span>
                </div>

                {generateAISummary && (
                  <div className="flex items-center space-x-3">
                    <label className="text-sm font-medium text-gray-600">
                      Length:
                    </label>
                    <select
                      value={summaryLength}
                      onChange={(e) => setSummaryLength(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="short">Short</option>
                      <option value="medium">Medium</option>
                      <option value="long">Long</option>
                    </select>
                  </div>
                )}
              </div>

              {generateAISummary && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-purple-800 flex items-center mb-2">
                    <Sparkles size={14} className="mr-2" />
                    <strong>Universal AI Agent Features:</strong>
                  </p>
                  <ul className="text-xs text-purple-700 space-y-1 ml-4">
                    <li>• Advanced video transcript analysis</li>
                    <li>• Intelligent content summarization</li>
                    <li>• Key points extraction</li>
                    <li>• Multi-language support</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          <ErrorDisplay error={error} />
        </div>
      </div>
    </div>
  );
};
