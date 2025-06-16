import { Search, Globe } from "lucide-react";

export const ContentExtractorForm = ({
  url,
  setUrl,
  loading,
  error,
  onExtract,
  onKeyPress,
}) => {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Content Extractor
      </h2>

      {/* URL Input */}
      <div className="flex space-x-2 mb-4">
        <div className="flex-1 relative">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="Enter website URL to extract content..."
            className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <Globe
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
        </div>
        <button
          onClick={onExtract}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium flex items-center space-x-2"
        >
          <Search size={20} />
          <span>{loading ? "Extracting..." : "Extract"}</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {loading && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
          Extracting content from the webpage... This may take a few seconds.
        </div>
      )}
    </div>
  );
};
