import {
  Folder,
  Edit3,
  Trash2,
  Tag,
  Eye,
  EyeOff,
  Youtube,
  FileText,
  StickyNote,
  CheckSquare,
} from "lucide-react";

export const CollectionCard = ({ collection, onEdit, onDelete, onOpen }) => {
  const getItemTypeIcon = (itemType) => {
    switch (itemType) {
      case "youtube":
        return <Youtube size={14} className="text-red-500" />;
      case "content":
        return <FileText size={14} className="text-blue-500" />;
      case "sticky-note":
        return <StickyNote size={14} className="text-yellow-500" />;
      case "todo":
        return <CheckSquare size={14} className="text-green-500" />;
      default:
        return <Folder size={14} className="text-gray-500" />;
    }
  };

  const getItemTypeCounts = () => {
    const counts = {};
    collection.items.forEach((item) => {
      counts[item.itemType] = (counts[item.itemType] || 0) + 1;
    });
    return counts;
  };

  const itemCounts = getItemTypeCounts();

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 p-4 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: collection.color }}
          >
            <Folder size={16} />
          </div>
          <div>
            <h3
              className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
              onClick={() => onOpen(collection)}
            >
              {collection.name}
            </h3>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>{collection.items.length} items</span>
              {!collection.isPrivate && <Eye size={12} />}
              {collection.isPrivate && <EyeOff size={12} />}
            </div>
          </div>
        </div>

        <div className="flex space-x-1">
          <button
            onClick={() => onEdit(collection)}
            className="text-gray-400 hover:text-blue-600 p-1"
            title="Edit collection"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => onDelete(collection)}
            className="text-gray-400 hover:text-red-600 p-1"
            title="Delete collection"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {collection.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {collection.description}
        </p>
      )}

      {/* Item type counts */}
      {collection.items.length > 0 && (
        <div className="flex items-center space-x-3 mb-3">
          {Object.entries(itemCounts).map(([type, count]) => (
            <div key={type} className="flex items-center space-x-1">
              {getItemTypeIcon(type)}
              <span className="text-xs text-gray-600">{count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      {collection.tags && collection.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {collection.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
            >
              <Tag size={10} className="mr-1" />
              {tag}
            </span>
          ))}
          {collection.tags.length > 3 && (
            <span className="text-xs text-gray-500">
              +{collection.tags.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
};
