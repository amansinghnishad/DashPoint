import { useState, useEffect } from "react";
import { useDashboard } from "../../context/DashboardContext";
import { AddToCollectionModal } from "../add-to-collection-modal/AddToCollectionModal";
import { StickyNote } from "./components/StickyNote";
import {
  createNewNote,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
} from "./utils/stickyNotesHelpers";

export const StickyNotesContainer = () => {
  const { stickyNotes, saveStickyNote, deleteStickyNote } = useDashboard();
  const [draggedNote, setDraggedNote] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [noteToAdd, setNoteToAdd] = useState(null);

  // Create new note function
  const handleCreateNewNote = () => {
    const newNote = createNewNote();
    saveStickyNote(newNote);
  };

  // Mouse down handler for dragging
  const handleNoteDragStart = (e, note) => {
    const { dragOffset: offset, shouldStartDrag } = handleMouseDown(e, note);
    if (!shouldStartDrag) return;

    setDragOffset(offset);
    setDraggedNote(note);
    setIsDragging(true);
    e.preventDefault();
  };

  // Mouse move handler for dragging
  const handleNoteDragMove = (e) => {
    if (!isDragging || !draggedNote) return;

    const newPosition = handleMouseMove(e, draggedNote, dragOffset);
    if (newPosition) {
      saveStickyNote({
        ...draggedNote,
        position: newPosition,
      });
    }
  };

  // Mouse up handler for dragging
  const handleNoteDragEnd = () => {
    const cleanup = handleMouseUp();
    setDraggedNote(null);
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
    cleanup();
  };

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleNoteDragMove);
      document.addEventListener("mouseup", handleNoteDragEnd);
      document.body.style.userSelect = "none";

      return () => {
        document.removeEventListener("mousemove", handleNoteDragMove);
        document.removeEventListener("mouseup", handleNoteDragEnd);
        document.body.style.userSelect = "";
      };
    }
  }, [isDragging, draggedNote, dragOffset]);

  // Handle adding note to collection
  const handleAddToCollection = (note) => {
    setNoteToAdd(note);
    setShowAddToCollection(true);
  };

  // Handle closing collection modal
  const handleCloseCollectionModal = () => {
    setShowAddToCollection(false);
    setNoteToAdd(null);
  };

  return (
    <div className="sticky-notes-container relative min-h-screen p-4">
      <div className="mb-4">
        <button
          onClick={handleCreateNewNote}
          className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-800 rounded-lg font-medium shadow-sm"
        >
          + Add Sticky Note
        </button>
      </div>

      <div className="relative">
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
            onMouseDown={(e) => handleNoteDragStart(e, note)}
          />
        ))}
      </div>

      {showAddToCollection && noteToAdd && (
        <AddToCollectionModal
          isOpen={showAddToCollection}
          onClose={handleCloseCollectionModal}
          itemType="sticky-note"
          itemId={noteToAdd._id || noteToAdd.id}
          itemTitle={noteToAdd.title || "Untitled Note"}
        />
      )}
    </div>
  );
};
