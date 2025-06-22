import { Search, Globe, Sparkles } from "lucide-react";
import { Input, Button, ErrorDisplay } from "../../ui";

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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6 shadow-lg">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
          Content Extractor
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Extract clean, readable content from any webpage with Universal
          AI-powered precision and intelligent summarization
        </p>
        <div className="flex justify-center mt-4">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            <span className="text-sm font-medium text-green-800">
              Universal AI Agent Active
            </span>
          </div>
        </div>
      </div>{" "}
      {/* URL Input Section */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 backdrop-blur-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-9">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Website URL
              </label>
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={onKeyPress}
                placeholder="Enter website URL to extract content (e.g., https://example.com/article)"
                icon={<Globe size={20} />}
                disabled={loading}
                className="h-16 text-base px-6"
              />
            </div>
            <div className="lg:col-span-3">
              <Button
                onClick={onExtract}
                disabled={loading || !url.trim()}
                loading={loading}
                variant="primary"
                size="lg"
                className="w-full px-8 py-5 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-base font-medium"
              >
                {loading ? (
                  "Extracting..."
                ) : (
                  <>
                    <Search size={20} />
                    Extract Content
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        <ErrorDisplay error={error} />

        {/* Loading State */}
        {loading && (
          <div className="mt-6 max-w-6xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
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
