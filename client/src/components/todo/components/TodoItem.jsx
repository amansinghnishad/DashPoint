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
import { priorityColors } from "../utils/todoHelpers";

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
      <div className="backdrop-blur-sm bg-white/90 rounded-2xl border border-white/20 shadow-xl p-6">
        <div className="mb-4">
          <h4 className="text-lg font-bold text-gray-900 mb-1">Edit Todo</h4>
          <p className="text-gray-600 text-sm">Update your task details</p>
        </div>

        <div className="space-y-4">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Todo title..."
              className="w-full p-4 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200"
              autoFocus
            />
          </div>

          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)..."
              className="w-full p-4 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200 resize-none"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📅 Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-4 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🚩 Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-4 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200"
              >
                <option value="low">🟢 Low Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="high">🔴 High Priority</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200/50">
            <button
              onClick={handleCancel}
              className="px-6 py-3 text-gray-700 bg-white/70 backdrop-blur-sm hover:bg-gray-50 rounded-xl border border-gray-200/50 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg font-semibold"
            >
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      className={`group backdrop-blur-sm bg-white/90 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl p-6 transition-all duration-300 overflow-hidden hover-sweep hover-sweep-green ${
        todo.completed ? "opacity-70" : "hover:transform hover:scale-[1.02]"
      }`}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-emerald-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start space-x-4">
          <button
            onClick={() => onToggle(todo._id || todo.id)}
            className={`mt-1 w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${
              todo.completed
                ? "bg-gradient-to-r from-green-500 to-emerald-500 border-green-500 text-white shadow-lg"
                : "border-gray-300 hover:border-green-500 hover:bg-green-50"
            }`}
          >
            {todo.completed && <Check size={14} />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <h3
                className={`font-semibold text-lg leading-tight ${
                  todo.completed
                    ? "line-through text-gray-500"
                    : "text-gray-900"
                }`}
              >
                {todo.title}
              </h3>

              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => onAddToCollection(todo)}
                  className="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                  title="Add to Collection"
                >
                  <FolderPlus size={16} />
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  title="Edit"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => onDelete(todo._id || todo.id)}
                  className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {todo.description && (
              <p
                className={`text-sm mb-3 leading-relaxed ${
                  todo.completed ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {todo.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center px-3 py-1 text-xs rounded-lg font-medium ${
                  priorityColors[todo.priority]
                }`}
              >
                <Flag size={12} className="mr-1" />
                {todo.priority.charAt(0).toUpperCase() +
                  todo.priority.slice(1)}{" "}
                Priority
              </span>

              {todo.dueDate && (
                <span
                  className={`inline-flex items-center space-x-1 px-3 py-1 text-xs rounded-lg font-medium ${
                    new Date(todo.dueDate) < new Date() && !todo.completed
                      ? "bg-red-100 text-red-800 border border-red-200"
                      : "bg-gray-100 text-gray-700 border border-gray-200"
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
    </div>
  );
};
