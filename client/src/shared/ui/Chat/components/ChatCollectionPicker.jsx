export default function ChatCollectionPicker({
  open,
  collectionsLoading,
  collectionsError,
  collections,
  selectedCollectionIds,
  onToggleCollection,
}) {
  if (!open) return null;

  return (
    <div className="mb-2 rounded-xl border dp-border dp-surface-muted p-2">
      {collectionsLoading ? (
        <p className="text-xs dp-text-muted">Loading collections...</p>
      ) : collectionsError ? (
        <p className="text-xs dp-text-danger">{collectionsError}</p>
      ) : !collections.length ? (
        <p className="text-xs dp-text-muted">No collections found.</p>
      ) : (
        <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto pr-1">
          {collections.map((collection) => {
            const selected = selectedCollectionIds.includes(collection.id);
            return (
              <button
                key={collection.id}
                type="button"
                onClick={() => onToggleCollection(collection.id)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  selected
                    ? "dp-btn-primary border-transparent"
                    : "dp-surface dp-border dp-text-muted"
                }`}
              >
                {collection.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
