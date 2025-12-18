import { useState } from "react";
import { Modal, Input, Button, Textarea } from "../../ui";
import { DEFAULT_COLORS, processTags } from "../utils/collectionsHelpers";

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
    tags: collection?.tags?.join(", ") || "",
    isPrivate:
      collection?.isPrivate !== undefined ? collection.isPrivate : true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      ...formData,
      name: formData.name.trim(),
      tags: processTags(formData.tags),
    };

    try {
      await onSave(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      maxWidth="max-w-lg"
      showCloseButton={true}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-900">
              {collection ? "Edit collection" : "New collection"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">Keep it simple.</p>
          </div>
          <div
            className="w-9 h-9 rounded-lg border border-gray-200"
            style={{ backgroundColor: formData.color }}
            aria-label="Selected color"
            title="Selected color"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Collection name"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Optional"
              rows={3}
              maxLength={500}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_COLORS.map((color) => {
                const isSelected = formData.color === color;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-full border transition-colors ${
                      isSelected
                        ? "border-gray-400 ring-2 ring-blue-500/40"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                    title={color}
                  />
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <Input
              type="text"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              placeholder="tag1, tag2"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={formData.isPrivate}
              onChange={(e) =>
                setFormData({ ...formData, isPrivate: e.target.checked })
              }
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Private
          </label>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !formData.name.trim()}
            >
              {loading ? "Saving…" : collection ? "Save" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
