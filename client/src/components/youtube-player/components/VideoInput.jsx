import { Youtube, Search, Sparkles } from "lucide-react";
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
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <Youtube size={16} className="text-gray-700" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-900">YouTube</h1>
            <p className="text-sm text-gray-600">
              Add videos to your playlist.
            </p>
          </div>
        </div>

        <div className="hidden sm:inline-flex items-center gap-2 text-xs text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          AI ready
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row gap-3 items-end">
          <div className="flex-1">
            <Input
              label="YouTube URL"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="https://www.youtube.com/watch?v=..."
              icon={<Youtube size={18} />}
              disabled={loading}
              className="h-11"
            />
          </div>
          <Button
            onClick={onAddVideo}
            disabled={loading || !videoUrl.trim()}
            loading={loading}
            variant="primary"
            size="lg"
            className="h-11 whitespace-nowrap"
            icon={<Search size={18} />}
          >
            Add
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-t pt-4">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={generateAISummary}
              onChange={(e) => setGenerateAISummary(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="inline-flex items-center gap-2">
              <Sparkles size={14} className="text-gray-500" />
              Generate AI summary
            </span>
          </label>

          {generateAISummary && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Length</label>
              <select
                value={summaryLength}
                onChange={(e) => setSummaryLength(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>
          )}
        </div>

        <ErrorDisplay error={error} />
      </div>
    </div>
  );
};
