import { useState } from "react";
import { Modal, Input, Button, Textarea } from "../../ui";

export const CollectionForm = ({
  collection,
  onSave,
  onCancel,
  isOpen = true,
}) => {
  const [formData, setFormData] = useState({
    name: collection?.name || "",
    description: collection?.description || "",
    color: collection?.color || "#3B82F6",
    icon: collection?.icon || "Folder",
    tags: collection?.tags?.join(", ") || "",
    isPrivate:
      collection?.isPrivate !== undefined ? collection.isPrivate : true,
  });
  const [loading, setLoading] = useState(false);

  const colors = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#84CC16",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      ...formData,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
    };

    await onSave(data);
    setLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      maxWidth="max-w-lg"
      showCloseButton={true}
    >
      <div className="p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: formData.color }}
            >
              📁
            </div>
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
            {collection ? "Edit Collection" : "Create New Collection"}
          </h3>
          <p className="text-gray-600 mt-2">
            {collection
              ? "Update your collection details"
              : "Organize your content beautifully"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Collection Name *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter a memorable collection name"
              required
              maxLength={100}
            />
          </div>{" "}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe what this collection contains..."
              rows={3}
              maxLength={500}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Collection Color
            </label>
            <div className="flex flex-wrap gap-3">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-12 h-12 rounded-xl border-2 transform hover:scale-110 transition-all duration-200 shadow-lg ${
                    formData.color === color
                      ? "border-gray-400 scale-110 shadow-xl"
                      : "border-white/50 hover:border-gray-300"
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Select ${color}`}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tags (comma separated)
            </label>
            <Input
              type="text"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              placeholder="productivity, work, personal"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate tags with commas to help organize and find your
              collection
            </p>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-gray-50/80 rounded-xl">
            <input
              type="checkbox"
              id="isPrivate"
              checked={formData.isPrivate}
              onChange={(e) =>
                setFormData({ ...formData, isPrivate: e.target.checked })
              }
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
            />
            <div>
              <label
                htmlFor="isPrivate"
                className="text-sm font-semibold text-gray-700 cursor-pointer"
              >
                Private collection
              </label>
              <p className="text-xs text-gray-500">
                Only you can see and access this collection
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200/50">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : collection ? (
                "Update Collection"
              ) : (
                "Create Collection"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
