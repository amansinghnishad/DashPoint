import { useState, useRef, useEffect } from "react";
import { X, Edit3, Palette, Save, FolderPlus } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { formatDateTime } from "../utils/dateUtils";
import { AddToCollectionModal } from "./AddToCollectionModal";

const StickyNote = ({
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

  const colors = [
    "#fef3c7",
    "#dcfce7",
    "#dbeafe",
    "#f3e8ff",
    "#fed7d7",
    "#fbb6ce",
    "#d6f5d6",
    "#b6e6ff",
  ];

  // handleSave function
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

  // handleEdit function
  const handleEdit = (e) => {
    e.stopPropagation(); // Prevent drag from starting
    setIsEditing(true);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  };

  // handleColorPicker function
  const handleColorPicker = (e) => {
    e.stopPropagation(); // Prevent drag from starting
    setShowColorPicker(!showColorPicker);
  };
  // handleDelete function
  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent drag from starting
    onDelete(note._id || note.id);
  };

  // handleKeyDown function
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
      {" "}
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        {" "}
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
            <Palette size={14} />
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
      </div>{" "}
      {/* Color Picker */}
      {showColorPicker && (
        <div className="absolute top-12 right-0 bg-white rounded-lg shadow-lg p-2 z-10">
          <div className="grid grid-cols-4 gap-1">
            {colors.map((clr) => (
              <button
                key={clr}
                onClick={(e) => {
                  e.stopPropagation();
                  setColor(clr);
                  setShowColorPicker(false);
                }}
                className={`w-6 h-6 rounded border-2 ${
                  color === clr ? "border-gray-800" : "border-gray-300"
                }`}
                style={{ backgroundColor: clr }}
              />
            ))}
          </div>
        </div>
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
          />{" "}
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

export const StickyNotes = () => {
  const { stickyNotes, saveStickyNote, deleteStickyNote } = useDashboard();
  const [draggedNote, setDraggedNote] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [noteToAdd, setNoteToAdd] = useState(null); // createNewNote function
  const createNewNote = () => {
    const newNote = {
      title: "New Note",
      content: "Click to edit this note",
      color: "#fef3c7",
      position: {
        x: Math.random() * 200 + 20,
        y: Math.random() * 100 + 20,
        z: 0,
      },
      size: {
        width: 200,
        height: 200,
      },
    };
    saveStickyNote(newNote);
  };

  // handleMouseDown function
  const handleMouseDown = (e, note) => {
    // Don't start drag if clicking on buttons or inputs
    if (
      e.target.tagName === "BUTTON" ||
      e.target.tagName === "INPUT" ||
      e.target.tagName === "TEXTAREA"
    ) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setDraggedNote(note);
    setIsDragging(true);

    // Prevent text selection while dragging
    e.preventDefault();
  };

  // handleMouseMove function
  const handleMouseMove = (e) => {
    if (!isDragging || !draggedNote) return;

    const containerRect = document
      .querySelector(".sticky-notes-container")
      ?.getBoundingClientRect();
    if (!containerRect) return;

    const newPosition = {
      x: Math.max(
        0,
        Math.min(
          e.clientX - containerRect.left - dragOffset.x,
          containerRect.width - 256
        )
      ), // 256 is note width
      y: Math.max(
        0,
        Math.min(
          e.clientY - containerRect.top - dragOffset.y,
          containerRect.height - 192
        )
      ), // 192 is min note height
    };

    saveStickyNote({
      ...draggedNote,
      position: newPosition,
    });
  };

  // handleMouseUp function
  const handleMouseUp = () => {
    setDraggedNote(null);
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
  };

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none"; // Prevent text selection

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.userSelect = "";
      };
    }
  }, [isDragging, draggedNote, dragOffset]);

  // handleAddToCollection function
  const handleAddToCollection = (note) => {
    setNoteToAdd(note);
    setShowAddToCollection(true);
  };

  return (
    <div className="sticky-notes-container relative min-h-screen p-4">
      <div className="mb-4">
        <button
          onClick={createNewNote}
          className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-800 rounded-lg font-medium shadow-sm"
        >
          + Add Sticky Note
        </button>
      </div>
      <div className="relative">
        {" "}
        {stickyNotes.map((note) => (
          <StickyNote
            key={note._id || note.id}
            note={note}
            onUpdate={saveStickyNote}
            onDelete={deleteStickyNote}
            onAddToCollection={handleAddToCollection}
            isDragging={
              draggedNote?._id === note._id || draggedNote?.id === note.id
            }
            onMouseDown={(e) => handleMouseDown(e, note)}
          />
        ))}
      </div>{" "}
      {showAddToCollection && noteToAdd && (
        <AddToCollectionModal
          isOpen={showAddToCollection}
          onClose={() => {
            setShowAddToCollection(false);
            setNoteToAdd(null);
          }}
          itemType="sticky-note"
          itemId={noteToAdd._id || noteToAdd.id}
          itemTitle={noteToAdd.title || "Untitled Note"}
        />
      )}
    </div>
  );
};
