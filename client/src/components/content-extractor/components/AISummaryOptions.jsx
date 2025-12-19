import { Sparkles, Settings, ImageIcon, Link } from "lucide-react";

export const AISummaryOptions = ({
  generateAISummary,
  setGenerateAISummary,
  summaryLength,
  setSummaryLength,
  extractImages,
  setExtractImages,
  extractLinks,
  setExtractLinks,
  maxContentLength,
  setMaxContentLength,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2">
        <Settings size={18} className="text-gray-500" />
        <h3 className="text-base font-semibold text-gray-900">Options</h3>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label className="flex items-center gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              id="generateSummary"
              checked={generateAISummary}
              onChange={(e) => setGenerateAISummary(e.target.checked)}
              className="w-4 h-4 border-gray-300 rounded"
            />
            <span className="inline-flex items-center gap-2">
              <Sparkles size={14} className="text-gray-500" />
              Generate AI summary
            </span>
          </label>

          {generateAISummary && (
            <div className="mt-3 pl-7">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Summary length
              </label>
              <select
                value={summaryLength}
                onChange={(e) => setSummaryLength(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              id="extractImages"
              checked={extractImages}
              onChange={(e) => setExtractImages(e.target.checked)}
              className="w-4 h-4 border-gray-300 rounded"
            />
            <span className="inline-flex items-center gap-2">
              <ImageIcon size={14} className="text-gray-500" />
              Extract images
            </span>
          </label>

          <label className="flex items-center gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              id="extractLinks"
              checked={extractLinks}
              onChange={(e) => setExtractLinks(e.target.checked)}
              className="w-4 h-4 border-gray-300 rounded"
            />
            <span className="inline-flex items-center gap-2">
              <Link size={14} className="text-gray-500" />
              Extract links
            </span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max content length: {maxContentLength.toLocaleString()} characters
          </label>
          <input
            type="range"
            min="1000"
            max="50000"
            step="1000"
            value={maxContentLength}
            onChange={(e) => setMaxContentLength(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1K</span>
            <span>25K</span>
            <span>50K</span>
          </div>
        </div>
      </div>
    </div>
  );
};
