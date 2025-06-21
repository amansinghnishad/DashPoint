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
          {" "}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={onKeyPress}
                placeholder="Enter website URL to extract content..."
                icon={<Globe size={20} />}
                disabled={loading}
              />
            </div>
            <Button
              onClick={onExtract}
              disabled={loading || !url.trim()}
              loading={loading}
              variant="primary"
              size="lg"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
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

        <ErrorDisplay error={error} />

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
