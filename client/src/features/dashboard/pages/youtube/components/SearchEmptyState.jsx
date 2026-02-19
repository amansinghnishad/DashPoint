export default function SearchEmptyState({
  isSearchMode,
  search,
  searchState,
}) {
  if (!isSearchMode) {
    return (
      <div className="p-4 text-center">
        <p className="dp-text font-semibold">No videos yet</p>
        <p className="dp-text-muted mt-1 text-sm">
          Click "Add" to paste a YouTube URL.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 text-center">
      <p className="dp-text font-semibold">
        {searchState.isLoading
          ? "Searching YouTube..."
          : searchState.error
            ? "Search failed"
            : (search || "").trim().length < 2
              ? "Type at least 2 characters"
              : "No results"}
      </p>
      <p className="dp-text-muted mt-1 text-sm">
        {searchState.error
          ? String(searchState.error)
          : "Search pulls live results from YouTube."}
      </p>
    </div>
  );
}
