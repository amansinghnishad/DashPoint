import { useState } from "react";
import { Plus } from "lucide-react";
import { Input, Button, Textarea, Select } from "../../ui";

export const TodoForm = ({ onAdd, onCancel }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd({
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        priority,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setTitle("");
      setDescription("");
      setDueDate("");
      setPriority("medium");
    }
  };

  return (
    <div className="backdrop-blur-sm bg-white/90 rounded-2xl border border-white/20 shadow-xl p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Create New Todo
        </h3>
        <p className="text-gray-600">Add a new task to your list</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            autoFocus
          />
        </div>{" "}
        <div>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description (optional)..."
            rows={3}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📅 Due Date (Optional)
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🚩 Priority Level
            </label>
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              options={[
                { value: "low", label: "🟢 Low Priority" },
                { value: "medium", label: "🟡 Medium Priority" },
                { value: "high", label: "🔴 High Priority" },
              ]}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200/50">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Add Todo</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
