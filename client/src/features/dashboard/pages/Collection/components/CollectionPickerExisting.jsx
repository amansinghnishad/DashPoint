import {
  getPickerCollectionItemType,
  getPickerItemId,
  getPickerItemLabel,
} from "../hooks/collectionPickerUtils";

export default function CollectionPickerExisting({
  tool,
  loading,
  search,
  setSearch,
  filtered,
  selectedId,
  setSelectedId,
  existingKeys,
}) {
  return (
    <>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
        className="bg-canvas border border-hairline text-ink w-full rounded-xl px-4 py-2 text-sm outline-none"
        disabled={loading}
      />

      {loading ? (
        <div className="text-muted text-sm font-medium">Loading...</div>
      ) : filtered.length ? (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {filtered.slice(0, 60).map((it) => {
            const id = getPickerItemId(it);
            if (!id) return null;

            const { title: rowTitle, subtitle } = getPickerItemLabel(tool, it);
            const itemType = getPickerCollectionItemType(tool);
            const key = itemType ? `${itemType}:${id}` : null;
            const alreadyAdded = key ? existingKeys?.has?.(key) : false;
            const isActive = String(selectedId || "") === String(id);

            return (
              <button
                key={String(id)}
                type="button"
                onClick={() => setSelectedId(id)}
                className={`w-full rounded-2xl px-4 py-3.5 text-left transition-colors border ${
                  isActive
                    ? "border-primary bg-canvas-soft shadow-sm"
                    : "border-hairline bg-surface-card hover:bg-canvas-soft/50"
                } ${alreadyAdded ? "opacity-60 cursor-not-allowed" : ""}`}
                disabled={alreadyAdded}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-ink font-semibold text-sm truncate">{rowTitle}</p>
                    {subtitle ? (
                      <p className="text-muted mt-0.5 text-xs line-clamp-2 leading-relaxed">{subtitle}</p>
                    ) : null}
                  </div>
                  {alreadyAdded ? (
                    <span className="text-muted text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">Added</span>
                  ) : null}
                </div>
              </button>
            );
          })}

          {filtered.length > 60 ? (
            <p className="text-muted text-xs">Showing 60 of {filtered.length}</p>
          ) : null}
        </div>
      ) : (
        <div className="bg-canvas-soft border border-hairline rounded-2xl p-4">
          <p className="text-ink font-semibold text-sm">Nothing to add</p>
          <p className="text-muted mt-1 text-xs">Use "Create new" to add items from here.</p>
        </div>
      )}
    </>
  );
}
