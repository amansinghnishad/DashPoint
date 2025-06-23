import { Sparkles, Brain, Settings, ImageIcon, Link } from "lucide-react";

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
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mt-6">
      <div className="flex items-center mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg mr-3">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            DashPoint AI Options
          </h3>
          <p className="text-sm text-gray-600">
            Enhance content extraction with AI-powered features
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* AI Summary Option */}
        <div className="border border-purple-200 rounded-lg p-4 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="generateSummary"
                checked={generateAISummary}
                onChange={(e) => setGenerateAISummary(e.target.checked)}
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label
                htmlFor="generateSummary"
                className="flex items-center text-sm font-medium text-gray-700"
              >
                <Sparkles size={16} className="mr-2 text-purple-600" />
                Generate DashPoint AI Summary
              </label>
            </div>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
              Enhanced
            </span>
          </div>

          {generateAISummary && (
            <div className="ml-8 space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-600 min-w-max">
                  Summary Length:
                </label>
                <select
                  value={summaryLength}
                  onChange={(e) => setSummaryLength(e.target.value)}
                  className="flex-1 px-3 py-2 border border-purple-300 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="short">Short (1-2 paragraphs)</option>
                  <option value="medium">Medium (3-4 paragraphs)</option>
                  <option value="long">Long (5+ paragraphs)</option>
                </select>
              </div>

              <div className="bg-purple-100 border border-purple-200 rounded-lg p-3">
                <p className="text-sm text-purple-800 flex items-center mb-2">
                  <Sparkles size={14} className="mr-2" />
                  <strong>DashPoint AI Features:</strong>
                </p>
                <ul className="text-xs text-purple-700 space-y-1 ml-4">
                  <li>• Advanced content analysis and key points extraction</li>
                  <li>• Intelligent summarization with context preservation</li>
                  <li>• Multi-language content processing</li>
                  <li>• Enhanced readability optimization</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Content Extraction Options */}
        <div className="border border-blue-200 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-cyan-50">
          <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
            <Settings size={16} className="mr-2 text-blue-600" />
            Content Extraction Options
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="extractImages"
                checked={extractImages}
                onChange={(e) => setExtractImages(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="extractImages"
                className="flex items-center text-sm text-gray-700"
              >
                <ImageIcon size={14} className="mr-2 text-blue-600" />
                Extract Images
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="extractLinks"
                checked={extractLinks}
                onChange={(e) => setExtractLinks(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="extractLinks"
                className="flex items-center text-sm text-gray-700"
              >
                <Link size={14} className="mr-2 text-blue-600" />
                Extract Links
              </label>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Content Length: {maxContentLength.toLocaleString()} characters
            </label>
            <input
              type="range"
              min="1000"
              max="50000"
              step="1000"
              value={maxContentLength}
              onChange={(e) => setMaxContentLength(parseInt(e.target.value))}
              className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1K</span>
              <span>25K</span>
              <span>50K</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
