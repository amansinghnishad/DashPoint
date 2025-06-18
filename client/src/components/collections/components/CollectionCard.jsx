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
import { getItemTypeCounts } from "../utils/collectionsHelpers";

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

  const itemCounts = getItemTypeCounts(collection.items);
  return (
    <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 hover:border-blue-200/50 p-6 transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-2xl shadow-lg overflow-hidden hover-sweep hover-sweep-blue">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300"
              style={{
                background: `linear-gradient(135deg, ${collection.color}dd, ${collection.color})`,
              }}
            >
              <Folder size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors duration-200 text-lg truncate group-hover:text-blue-700"
                onClick={() => onOpen(collection)}
                title={collection.name}
              >
                {collection.name}
              </h3>
              <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                <span className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2" />
                  {collection.items.length} items
                </span>
                <div className="flex items-center">
                  {!collection.isPrivate ? (
                    <Eye size={14} className="text-green-500" />
                  ) : (
                    <EyeOff size={14} className="text-gray-400" />
                  )}
                  <span className="ml-1 text-xs">
                    {collection.isPrivate ? "Private" : "Public"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => onEdit(collection)}
              className="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
              title="Edit collection"
            >
              <Edit3 size={16} />
            </button>
            <button
              onClick={() => onDelete(collection)}
              className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
              title="Delete collection"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {collection.description && (
          <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {collection.description}
          </p>
        )}

        {/* Item type counts with enhanced styling */}
        {collection.items.length > 0 && (
          <div className="flex items-center justify-center mb-4 p-3 bg-gray-50/80 rounded-xl">
            <div className="flex items-center space-x-4">
              {Object.entries(itemCounts).map(([type, count]) => (
                <div
                  key={type}
                  className="flex items-center space-x-2 px-3 py-1 bg-white rounded-lg shadow-sm"
                >
                  {getItemTypeIcon(type)}
                  <span className="text-sm font-medium text-gray-700">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags with improved design */}
        {collection.tags && collection.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {collection.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200/50"
              >
                <Tag size={10} className="mr-1" />
                {tag}
              </span>
            ))}
            {collection.tags.length > 3 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                +{collection.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Click area indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl" />
      </div>
    </div>
  );
};
