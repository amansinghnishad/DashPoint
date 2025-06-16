import { Folder, Check } from "lucide-react";

export const CollectionList = ({
  collections,
  itemCollections,
  onToggleCollection,
  loading,
}) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Folder size={48} className="mx-auto mb-2 opacity-50" />
        <p>No collections found</p>
        <p className="text-sm">Create your first collection below</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {collections.map((collection) => {
        const isInCollection = itemCollections.includes(collection._id);

        return (
          <div
            key={collection._id}
            className={`flex items-center justify-between p-3 border rounded cursor-pointer transition-colors ${
              isInCollection
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:bg-gray-50"
            }`}
            onClick={() => onToggleCollection(collection._id, !isInCollection)}
          >
            <div className="flex items-center space-x-3">
              <Folder
                size={20}
                className={isInCollection ? "text-blue-600" : "text-gray-400"}
              />
              <div>
                <h4 className="font-medium text-gray-900">{collection.name}</h4>
                <p className="text-sm text-gray-500">
                  {collection.items?.length || 0} items
                </p>
              </div>
            </div>
            {isInCollection && <Check size={18} className="text-blue-600" />}
          </div>
        );
      })}
    </div>
  );
};
