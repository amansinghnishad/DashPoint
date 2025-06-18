import { Search, Globe, Sparkles } from "lucide-react";

export const ContentExtractorForm = ({
  url,
  setUrl,
  loading,
  error,
  onExtract,
  onKeyPress,
}) => {
  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 shadow-lg">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
          Content Extractor
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Extract clean, readable content from any webpage with AI-powered
          precision
        </p>
      </div>

      {/* URL Input Section */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative group">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={onKeyPress}
                placeholder="Enter website URL to extract content..."
                className="w-full px-4 py-4 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                disabled={loading}
              />
              <Globe
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200"
                size={20}
              />
            </div>
            <button
              onClick={onExtract}
              disabled={loading || !url.trim()}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl font-semibold flex items-center justify-center space-x-3 transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              <Search size={20} />
              <span className="whitespace-nowrap">
                {loading ? "Extracting..." : "Extract Content"}
              </span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="font-medium">Error:</span>
              </div>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mt-4 max-w-4xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                <span className="font-medium">
                  Extracting content from the webpage...
                </span>
              </div>
              <p className="mt-1 text-sm text-blue-600">
                This may take a few seconds while we process the page.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
