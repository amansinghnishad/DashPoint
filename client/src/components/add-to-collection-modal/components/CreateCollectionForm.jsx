import { useState } from "react";
import { Plus } from "lucide-react";

export const CreateCollectionForm = ({
  onCreateCollection,
  isCreating = false,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [collectionName, setCollectionName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!collectionName.trim()) return;

    const success = await onCreateCollection(collectionName.trim());
    if (success) {
      setCollectionName("");
      setShowForm(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setCollectionName("");
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full flex items-center justify-center space-x-2 p-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 text-sm"
      >
        <Plus size={14} />
        <span>Create New Collection</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="Collection name..."
        value={collectionName}
        onChange={(e) => setCollectionName(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        disabled={isCreating}
        autoFocus
      />
      <div className="flex space-x-2">
        <button
          type="submit"
          disabled={!collectionName.trim() || isCreating}
          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          {isCreating ? "Creating..." : "Create"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isCreating}
          className="px-3 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
