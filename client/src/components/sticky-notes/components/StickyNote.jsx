import { useState, useRef, useEffect } from "react";
import { X, Edit3, Save, FolderPlus } from "lucide-react";
import { Button, Input, Textarea } from "../../ui";
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
      className={`sticky-note relative w-full sm:w-64 min-h-40 sm:min-h-48 p-3 sm:p-4 rounded-lg shadow-lg transform transition-transform duration-200 select-none mb-4 sm:mb-0 ${
        isDragging
          ? "scale-105 shadow-xl cursor-grabbing z-50"
          : "cursor-grab hover:scale-102"
      }`}
      style={{
        backgroundColor: color,
        position:
          note.position && window.innerWidth >= 640 ? "absolute" : "relative",
        left:
          note.position && window.innerWidth >= 640
            ? note.position?.x || "auto"
            : "auto",
        top:
          note.position && window.innerWidth >= 640
            ? note.position?.y || "auto"
            : "auto",
      }}
      onMouseDown={onMouseDown}
    >
      {" "}
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex space-x-1 sm:space-x-2">
          <Button
            onClick={handleEdit}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-800 p-1 rounded touch-manipulation"
            title="Edit"
          >
            <Edit3 size={12} className="sm:hidden" />
            <Edit3 size={14} className="hidden sm:block" />
          </Button>
          <Button
            onClick={handleColorPicker}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-800 p-1 rounded touch-manipulation"
            title="Change Color"
          >
            <div
              className="w-3 h-3 sm:w-4 sm:h-4 rounded border border-gray-400"
              style={{ backgroundColor: color }}
            />
          </Button>
          <Button
            onClick={() => onAddToCollection(note)}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-blue-600 p-1 rounded touch-manipulation"
            title="Add to Collection"
          >
            <FolderPlus size={12} className="sm:hidden" />
            <FolderPlus size={14} className="hidden sm:block" />
          </Button>
        </div>
        <Button
          onClick={handleDelete}
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-700 p-1 rounded touch-manipulation"
          title="Delete"
        >
          <X size={12} className="sm:hidden" />
          <X size={14} className="hidden sm:block" />
        </Button>
      </div>
      {/* Color Picker */}
      {showColorPicker && (
        <ColorPicker
          currentColor={color}
          onColorChange={handleColorChange}
          onClose={() => setShowColorPicker(false)}
        />
      )}{" "}
      {/* Content */}
      {isEditing ? (
        <div className="space-y-2">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="w-full text-xs sm:text-sm font-semibold bg-transparent border-b border-gray-400 focus:outline-none focus:border-gray-600"
            onKeyDown={handleKeyDown}
          />
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note here..."
            className="w-full text-xs sm:text-sm bg-transparent resize-none focus:outline-none min-h-16 sm:min-h-24"
            onKeyDown={handleKeyDown}
          />

          <div className="flex justify-end space-x-1 sm:space-x-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(false);
              }}
              variant="secondary"
              size="sm"
              className="text-xs px-2 py-1 sm:px-3 sm:py-1.5"
            >
              Cancel
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              variant="primary"
              size="sm"
              className="flex items-center space-x-1 text-xs px-2 py-1 sm:px-3 sm:py-1.5"
            >
              <Save size={10} className="sm:hidden" />
              <Save size={12} className="hidden sm:block" />
              <span>Save</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {title && (
            <h3 className="font-semibold text-xs sm:text-sm text-gray-800 line-clamp-2">
              {title}
            </h3>
          )}
          <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap line-clamp-4 sm:line-clamp-6">
            {content}
          </p>
          <div className="text-xs text-gray-500 mt-2 sm:mt-4">
            {formatDateTime(note.updatedAt, "MMM dd, HH:mm")}
          </div>
        </div>
      )}
    </div>
  );
};
