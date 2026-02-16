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
        className="dp-surface dp-border dp-text w-full rounded-xl border px-4 py-2 text-sm outline-none"
        disabled={loading}
      />

      {loading ? (
        <div className="dp-text-muted text-sm">Loading...</div>
      ) : filtered.length ? (
        <div className="space-y-2">
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
                className={`w-full rounded-2xl px-4 py-3 text-left transition-colors border ${
                  isActive
                    ? "dp-border dp-surface-muted border-2"
                    : "dp-border dp-surface"
                } ${alreadyAdded ? "opacity-60" : "dp-hover-bg"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="dp-text font-semibold truncate">{rowTitle}</p>
                    {subtitle ? (
                      <p className="dp-text-muted mt-0.5 text-sm line-clamp-2">
                        {subtitle}
                      </p>
                    ) : null}
                  </div>
                  {alreadyAdded ? (
                    <span className="dp-text-muted text-xs whitespace-nowrap">
                      Added
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}

          {filtered.length > 60 ? (
            <p className="dp-text-muted text-xs">
              Showing 60 of {filtered.length}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="dp-surface-muted dp-border rounded-2xl border p-4">
          <p className="dp-text font-semibold">Nothing to add</p>
          <p className="dp-text-muted mt-1 text-sm">
            Use "Create new" to add items from here.
          </p>
        </div>
      )}
    </>
  );
}