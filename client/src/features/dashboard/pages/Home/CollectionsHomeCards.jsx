import { IconCollection, IconDelete, IconEdit } from "@/shared/ui/icons/icons";

export function CollectionCard({ collection, onOpen, onEdit, onDelete }) {
  const name = collection?.name ?? "Untitled";
  const description = collection?.description ?? "";
  const tags = Array.isArray(collection?.tags) ? collection.tags : [];
  const itemsCount = Array.isArray(collection?.items)
    ? collection.items.length
    : typeof collection?.itemCount === "number"
      ? collection.itemCount
      : 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen?.(collection)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen?.(collection);
      }}
      className="dp-surface dp-border rounded-2xl border p-5 shadow-lg transition-transform duration-200 hover:-translate-y-0.5"
      aria-label={`Open collection ${name}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="dp-text text-base font-semibold truncate">{name}</p>
          {description ? (
            <p className="dp-text-muted mt-1 text-sm leading-6 line-clamp-2">{description}</p>
          ) : (
            <p className="dp-text-muted mt-1 text-sm leading-6">No description</p>
          )}

          {tags.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="dp-surface-muted dp-border dp-text-muted rounded-full border px-2.5 py-1 text-xs"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="dp-text-muted flex shrink-0 items-center gap-2 text-sm whitespace-nowrap sm:justify-end">
          <IconCollection size={16} />
          <span>{itemsCount}</span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(collection);
            }}
            className="dp-text-muted dp-hover-text dp-hover-bg inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
            aria-label="Edit collection"
            title="Edit"
          >
            <IconEdit size={16} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(collection);
            }}
            className="dp-text-muted dp-hover-text dp-hover-bg inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
            aria-label="Delete collection"
            title="Delete"
          >
            <IconDelete size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="dp-surface dp-border rounded-2xl border p-5 shadow-lg">
          <div className="dp-surface-muted h-4 w-2/3 rounded" />
          <div className="dp-surface-muted mt-3 h-3 w-full rounded" />
          <div className="dp-surface-muted mt-2 h-3 w-5/6 rounded" />
          <div className="mt-4 flex gap-2">
            <div className="dp-surface-muted h-6 w-16 rounded-full" />
            <div className="dp-surface-muted h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
