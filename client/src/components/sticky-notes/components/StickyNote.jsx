import { useState, useRef, useEffect } from "react";
import { X, Edit3, Save, FolderPlus } from "lucide-react";
import { formatDateTime } from "../../../utils/dateUtils";
import { ColorPicker } from "./ColorPicker";

export const StickyNote = ({
  note,
  onUpdate,
  onDelete,
  onAddToCollection,
  isDragging,
  onMouseDown,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title || "");
  const [content, setContent] = useState(note.content || "");
  const [color, setColor] = useState(note.color || "#fef3c7");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const textareaRef = useRef(null);
  const noteRef = useRef(null);

  const handleSave = () => {
    if (title.trim() || content.trim()) {
      onUpdate({
        ...note,
        title: title.trim(),
        content: content.trim(),
        color,
        updatedAt: new Date().toISOString(),
      });
    }
    setIsEditing(false);
  };

  const handleEdit = (e) => {
    e.stopPropagation(); // Prevent drag from starting
    setIsEditing(true);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  };

  const handleColorPicker = (e) => {
    e.stopPropagation(); // Prevent drag from starting
    setShowColorPicker(!showColorPicker);
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent drag from starting
    onDelete(note._id || note.id);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsEditing(false);
      setTitle(note.title || "");
      setContent(note.content || "");
      setColor(note.color || "#fef3c7");
    } else if (e.key === "Enter" && e.ctrlKey) {
      handleSave();
    }
  };

  const handleColorChange = (newColor) => {
    setColor(newColor);
    setShowColorPicker(false);
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [content, isEditing]);

  return (
    <div
      ref={noteRef}
      className={`sticky-note relative w-64 min-h-48 p-4 rounded-lg shadow-lg transform transition-transform duration-200 select-none ${
        isDragging
          ? "scale-105 shadow-xl cursor-grabbing z-50"
          : "cursor-grab hover:scale-102"
      }`}
      style={{
        backgroundColor: color,
        position: note.position ? "absolute" : "relative",
        left: note.position?.x || "auto",
        top: note.position?.y || "auto",
      }}
      onMouseDown={onMouseDown}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex space-x-2">
          <button
            onClick={handleEdit}
            className="text-gray-600 hover:text-gray-800 p-1 rounded"
            title="Edit"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={handleColorPicker}
            className="text-gray-600 hover:text-gray-800 p-1 rounded"
            title="Change Color"
          >
            <div
              className="w-4 h-4 rounded border border-gray-400"
              style={{ backgroundColor: color }}
            />
          </button>
          <button
            onClick={() => onAddToCollection(note)}
            className="text-gray-600 hover:text-blue-600 p-1 rounded"
            title="Add to Collection"
          >
            <FolderPlus size={14} />
          </button>
        </div>
        <button
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700 p-1 rounded"
          title="Delete"
        >
          <X size={14} />
        </button>
      </div>

      {/* Color Picker */}
      {showColorPicker && (
        <ColorPicker
          currentColor={color}
          onColorChange={handleColorChange}
          onClose={() => setShowColorPicker(false)}
        />
      )}

      {/* Content */}
      {isEditing ? (
        <div className="space-y-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="w-full p-2 text-sm font-semibold bg-transparent border-b border-gray-400 focus:outline-none focus:border-gray-600"
            onKeyDown={handleKeyDown}
          />
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note here..."
            className="w-full p-2 text-sm bg-transparent resize-none focus:outline-none min-h-24"
            onKeyDown={handleKeyDown}
          />

          <div className="flex justify-end space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(false);
              }}
              className="px-3 py-1 text-xs bg-gray-300 hover:bg-gray-400 rounded"
            >
              Cancel
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center space-x-1"
            >
              <Save size={12} />
              <span>Save</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {title && (
            <h3 className="font-semibold text-sm text-gray-800 line-clamp-2">
              {title}
            </h3>
          )}
          <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-6">
            {content}
          </p>
          <div className="text-xs text-gray-500 mt-4">
            {formatDateTime(note.updatedAt, "MMM dd, HH:mm")}
          </div>
        </div>
      )}
    </div>
  );
};
