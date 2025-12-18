import { Edit3, Trash2 } from "lucide-react";
import { getItemTypeCounts } from "../utils/collectionsHelpers";

export const CollectionCard = ({ collection, onEdit, onDelete, onOpen }) => {
  const itemCounts = getItemTypeCounts(collection.items);
  const itemCountEntries = Object.entries(itemCounts);
  const totalItems = collection.items?.length || 0;
  const accentColor = collection.color || "#3B82F6";

  return (
    <div
      className="group bg-white rounded-xl border border-gray-200 border-l-4 p-5 transition-shadow duration-200 hover:shadow-md"
      style={{ borderLeftColor: accentColor }}
    >
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => onOpen(collection)}
          className="flex items-start gap-3 min-w-0 text-left"
          title={collection.name}
        >
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {collection.name}
            </div>
            <div className="mt-1 text-sm text-gray-500">
              {totalItems} {totalItems === 1 ? "item" : "items"}
              {collection.isPrivate ? " · Private" : " · Public"}
            </div>
          </div>
        </button>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onEdit(collection)}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            title="Edit"
            aria-label="Edit collection"
          >
            <Edit3 size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(collection)}
            className="p-2 rounded-lg text-gray-500 hover:text-red-700 hover:bg-red-50 transition-colors"
            title="Delete"
            aria-label="Delete collection"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {collection.description && (
        <p className="mt-3 text-sm text-gray-600 line-clamp-2">
          {collection.description}
        </p>
      )}

      {itemCountEntries.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {itemCountEntries.slice(0, 3).map(([type, count]) => (
            <span
              key={type}
              className="px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200"
            >
              {type}: {count}
            </span>
          ))}
          {itemCountEntries.length > 3 && (
            <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
              +{itemCountEntries.length - 3} more
            </span>
          )}
        </div>
      )}

      {collection.tags && collection.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {collection.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200"
            >
              {tag}
            </span>
          ))}
          {collection.tags.length > 3 && (
            <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
              +{collection.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
