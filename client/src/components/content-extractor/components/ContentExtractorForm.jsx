import { Search, Globe } from "lucide-react";
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
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Content Extractor
        </h1>
        <p className="text-sm text-gray-600">
          Extract readable text from a webpage URL.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-9">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website URL
            </label>
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder="https://example.com/article"
              icon={<Globe size={18} />}
              disabled={loading}
              className="h-12 text-base"
            />
          </div>

          <div className="lg:col-span-3">
            <Button
              onClick={onExtract}
              disabled={loading || !url.trim()}
              loading={loading}
              variant="primary"
              size="lg"
              className="w-full h-12 text-base font-medium"
            >
              {loading ? (
                "Extracting…"
              ) : (
                <>
                  <Search size={18} />
                  Extract
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <ErrorDisplay error={error} />

      {loading && (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent" />
            <span className="font-medium">Extracting content…</span>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            This may take a few seconds.
          </p>
        </div>
      )}
    </div>
  );
};
