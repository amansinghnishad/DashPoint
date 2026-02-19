export default function YoutubeViewer({
  selected,
  isAdding,
  urlInput,
  onUrlChange,
  onAdd,
  onCancel,
  viewer,
  isLoading,
  inputRef,
}) {
  return (
    <div className="h-full">
      <div className="dp-surface dp-border border-b px-4 py-3">
        <p className="dp-text font-semibold truncate">
          {selected ? selected.title : "Viewer"}
        </p>
      </div>

      <div className="p-4">
        {isAdding ? (
          <div className="dp-surface-muted dp-border rounded-2xl border p-4">
            <p className="dp-text font-semibold">Add a YouTube video</p>
            <p className="dp-text-muted mt-1 text-sm">
              Paste a YouTube URL or video id.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                ref={inputRef}
                value={urlInput}
                onChange={(e) => onUrlChange(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="dp-surface dp-border dp-text w-full rounded-xl border px-4 py-2 text-sm outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onAdd}
                  className="dp-btn-primary rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
                  disabled={isLoading}
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {viewer}
      </div>
    </div>
  );
}
