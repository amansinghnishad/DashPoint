import {
  FolderOpen,
  Pencil,
  Trash2,
  Database,
  Palette,
} from "lucide-react";

export function CollectionCard({ collection, onOpen, onEdit, onDelete }) {
  const name = collection?.name ?? "Untitled";
  const description = collection?.description ?? "";
  const itemsCount = Array.isArray(collection?.items)
    ? collection.items.length
    : typeof collection?.itemCount === "number"
      ? collection.itemCount
      : 0;

  // Use a small visual cue for common collection types.
  const getIcon = () => {
    if (name.toLowerCase().includes("draft") || name.toLowerCase().includes("manifesto")) {
      return Pencil;
    }
    if (name.toLowerCase().includes("rag") || name.toLowerCase().includes("research")) {
      return Database;
    }
    if (name.toLowerCase().includes("visual") || name.toLowerCase().includes("identity")) {
      return Palette;
    }
    return FolderOpen;
  };

  const IconComponent = getIcon();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen?.(collection)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen?.(collection);
      }}
      className="bg-surface-card border border-hairline p-6 rounded-2xl flex flex-col justify-between h-[230px] shadow-sm relative cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
      aria-label={`Open collection ${name}`}
    >
      {/* Top Row */}
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl bg-canvas-soft border border-hairline/60 flex items-center justify-center text-ink shrink-0">
          <IconComponent size={18} />
        </div>
        <span className="text-[11px] font-semibold text-muted bg-canvas px-2.5 py-1 rounded-full">
          {itemsCount} {itemsCount === 1 ? "Item" : "Items"}
        </span>
      </div>

      {/* Middle Header & Description */}
      <div className="mt-2 flex-1">
        <h3 className="font-waldenburg-light text-lg text-ink font-bold tracking-tight">{name}</h3>
        {description ? (
          <p className="text-body text-xs leading-relaxed mt-2 line-clamp-2">{description}</p>
        ) : null}
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between mt-4 gap-2">
        <div
          className="flex items-center gap-1.5 opacity-100"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(collection);
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-hairline text-muted transition-colors hover:bg-canvas-soft hover:text-ink"
            title="Edit"
            aria-label={`Edit ${name}`}
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(collection);
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-hairline text-muted transition-colors hover:bg-semantic-error/10 hover:text-semantic-error"
            title="Delete"
            aria-label={`Delete ${name}`}
          >
            <Trash2 size={14} />
          </button>
        </div>

        <span className="text-[10px] font-medium text-muted">Open collection</span>
      </div>
    </div>
  );
}

export function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-surface-card border border-hairline rounded-2xl p-6 h-[230px] flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-canvas-soft border border-hairline/60 animate-pulse" />
            <div className="bg-canvas-soft h-4 w-2/3 rounded mt-4 animate-pulse" />
            <div className="bg-canvas-soft mt-3 h-3 w-full rounded animate-pulse" />
            <div className="bg-canvas-soft mt-2 h-3 w-5/6 rounded animate-pulse" />
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="bg-canvas-soft h-4 w-12 rounded animate-pulse" />
            <div className="bg-canvas-soft h-4 w-16 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
