import { useState } from "react";
import {
  Check,
  Calendar,
  Flag,
  Edit3,
  Save,
  Trash2,
  FolderPlus,
} from "lucide-react";
import { getRelativeTime } from "../../../utils/dateUtils";

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

export const TodoItem = ({
  todo,
  onUpdate,
  onDelete,
  onToggle,
  onAddToCollection,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || "");
  const [dueDate, setDueDate] = useState(
    todo.dueDate ? new Date(todo.dueDate).toISOString().split("T")[0] : ""
  );
  const [priority, setPriority] = useState(todo.priority || "medium");

  const handleSave = () => {
    if (title.trim()) {
      onUpdate({
        ...todo,
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        priority,
        updatedAt: new Date().toISOString(),
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTitle(todo.title);
    setDescription(todo.description || "");
    setDueDate(
      todo.dueDate ? new Date(todo.dueDate).toISOString().split("T")[0] : ""
    );
    setPriority(todo.priority || "medium");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Todo title..."
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)..."
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="2"
          />

          <div className="flex space-x-3">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-sm bg-gray-300 hover:bg-gray-400 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center space-x-1"
            >
              <Save size={14} />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 ${
        todo.completed ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start space-x-3">
        <button
          onClick={() => onToggle(todo._id || todo.id)}
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
            todo.completed
              ? "bg-green-500 border-green-500 text-white"
              : "border-gray-300 hover:border-green-500"
          }`}
        >
          {todo.completed && <Check size={12} />}
        </button>

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3
              className={`font-medium ${
                todo.completed ? "line-through text-gray-500" : "text-gray-900"
              }`}
            >
              {todo.title}
            </h3>

            <div className="flex space-x-1">
              <button
                onClick={() => onAddToCollection(todo)}
                className="text-gray-400 hover:text-blue-600 p-1"
                title="Add to Collection"
              >
                <FolderPlus size={14} />
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-gray-600 p-1"
                title="Edit"
              >
                <Edit3 size={14} />
              </button>
              <button
                onClick={() => onDelete(todo._id || todo.id)}
                className="text-gray-400 hover:text-red-500 p-1"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {todo.description && (
            <p
              className={`text-sm mt-1 ${
                todo.completed ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {todo.description}
            </p>
          )}

          <div className="flex items-center space-x-3 mt-2">
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                priorityColors[todo.priority]
              }`}
            >
              <Flag size={10} className="inline mr-1" />
              {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
            </span>

            {todo.dueDate && (
              <span
                className={`text-xs flex items-center space-x-1 ${
                  new Date(todo.dueDate) < new Date() && !todo.completed
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              >
                <Calendar size={12} />
                <span>{getRelativeTime(todo.dueDate)}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
