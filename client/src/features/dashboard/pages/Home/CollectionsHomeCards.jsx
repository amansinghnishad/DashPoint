import {
  FolderOpen,
  Pencil,
  Trash2,
  Star,
  Lock,
  ArrowUpRight,
  Plus,
  FileText,
  Database,
  Palette,
} from "lucide-react";
import { useState } from "react";

export function CollectionCard({ collection, onOpen, onEdit, onDelete }) {
  const name = collection?.name ?? "Untitled";
  const description = collection?.description ?? "";
  const itemsCount = Array.isArray(collection?.items)
    ? collection.items.length
    : typeof collection?.itemCount === "number"
      ? collection.itemCount
      : 0;

  const [isHovered, setIsHovered] = useState(false);

  // Check if this is the "Product Roadmap" card to apply the premium ink-black featured layout
  const isFeatured = name.toLowerCase().includes("product") || name.toLowerCase().includes("roadmap");
  const isPrivate = name.toLowerCase().includes("rag") || name.toLowerCase().includes("research");
  const isShared = name.toLowerCase().includes("visual") || name.toLowerCase().includes("identity");

  // Determine icon based on collection name for premium visual storytelling
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

  if (isFeatured) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpen?.(collection)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onOpen?.(collection);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="bg-primary border-none p-6 rounded-2xl flex flex-col justify-between h-[230px] shadow-lg relative cursor-pointer text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        aria-label={`Open collection ${name}`}
      >
        {/* Top Row */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-white/90 bg-white/10 px-2.5 py-1 rounded-full">
            {itemsCount || 48} Files
          </span>
          <Star size={16} className="text-white fill-white opacity-80" />
        </div>

        {/* Middle Header & Description */}
        <div className="mt-2 flex-1">
          <h3 className="font-waldenburg-light text-xl font-bold tracking-tight">{name}</h3>
          <p className="text-on-dark-soft text-xs leading-relaxed mt-2 line-clamp-2 opacity-80">{description || "Q3-Q4 strategic alignment for the Intelligence Layer expansion."}</p>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(collection);
              }}
              className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              title="Edit"
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(collection);
              }}
              className="text-white/60 hover:text-red-400 p-1 rounded-lg hover:bg-white/10 transition-colors"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>

          <div className={`w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white transition-transform duration-300 ${isHovered ? "rotate-45 bg-white/20" : ""}`}>
            <ArrowUpRight size={16} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen?.(collection)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen?.(collection);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-surface-card border border-hairline p-6 rounded-2xl flex flex-col justify-between h-[230px] shadow-sm relative cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
      aria-label={`Open collection ${name}`}
    >
      {/* Top Row */}
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl bg-canvas-soft border border-hairline/60 flex items-center justify-center text-ink shrink-0">
          <IconComponent size={18} />
        </div>
        <span className="text-[11px] font-semibold text-muted bg-canvas px-2.5 py-1 rounded-full">
          {itemsCount} {isShared ? "Assets" : "Items"}
        </span>
      </div>

      {/* Middle Header & Description */}
      <div className="mt-2 flex-1">
        <h3 className="font-waldenburg-light text-lg text-ink font-bold tracking-tight">{name}</h3>
        <p className="text-body text-xs leading-relaxed mt-2 line-clamp-2">{description || "No description provided."}</p>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between mt-4">
        <div className={`flex items-center gap-1.5 transition-opacity duration-200 opacity-100 lg:opacity-0 lg:group-hover:opacity-100`}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(collection);
            }}
            className="text-muted hover:text-ink p-1 rounded-lg hover:bg-canvas-soft transition-colors"
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(collection);
            }}
            className="text-muted hover:text-semantic-error p-1 rounded-lg hover:bg-canvas-soft transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Dynamic status metadata */}
        <div className="flex items-center gap-2">
          {isPrivate ? (
            <>
              <span className="text-[10px] font-bold text-muted-soft uppercase tracking-wider">Private Access</span>
              <Lock size={12} className="text-muted-soft" />
            </>
          ) : isShared ? (
            <>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-ink" />
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-mint" />
              </div>
              <span className="text-[10px] font-bold text-muted-soft uppercase tracking-wider">Shared</span>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-peach" />
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-lavender" />
              </div>
              <span className="text-[10px] font-bold text-muted-soft uppercase tracking-wider">Updated 2h ago</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-surface-card border border-hairline rounded-2xl p-6 h-[230px] flex flex-col justify-between">
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
