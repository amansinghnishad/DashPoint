import { Plus, CheckCircle, Upload, Star, Zap, StickyNote } from "lucide-react";
import { useState } from "react";

export const QuickActions = ({
  onAddNote,
  onAddTodo,
  onUploadFile,
  onBookmark,
  onNavigate,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const handleAddNote = () => {
    setActiveAction("note");
    // Add a slight delay to allow visual feedback before collapsing
    setTimeout(() => setIsExpanded(false), 200);
    onNavigate("sticky-notes");
    if (onAddNote) onAddNote();
    setTimeout(() => setActiveAction(null), 1000);
  };

  const handleAddTodo = () => {
    setActiveAction("todo");
    // Add a slight delay to allow visual feedback before collapsing
    setTimeout(() => setIsExpanded(false), 200);
    onNavigate("todos");
    if (onAddTodo) onAddTodo();
    setTimeout(() => setActiveAction(null), 1000);
  };

  const handleUploadFile = () => {
    setActiveAction("upload");
    // Add a slight delay to allow visual feedback before collapsing
    setTimeout(() => setIsExpanded(false), 200);
    onNavigate("files");
    if (onUploadFile) onUploadFile();
    setTimeout(() => setActiveAction(null), 1000);
  };

  const handleBookmark = () => {
    setActiveAction("bookmark");
    // Add a slight delay to allow visual feedback before collapsing
    setTimeout(() => setIsExpanded(false), 200);
    onNavigate("collections");
    if (onBookmark) onBookmark();
    setTimeout(() => setActiveAction(null), 1000);
  };
  const toggleQuickMenu = () => {
    setIsExpanded(!isExpanded);
  };

  const quickActions = [
    {
      id: "note",
      icon: StickyNote,
      label: "Add Note",
      color:
        "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
      action: handleAddNote,
    },
    {
      id: "todo",
      icon: CheckCircle,
      label: "Add Todo",
      color:
        "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
      action: handleAddTodo,
    },
    {
      id: "upload",
      icon: Upload,
      label: "Upload File",
      color:
        "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
      action: handleUploadFile,
    },
    {
      id: "bookmark",
      icon: Star,
      label: "Add to Collection",
      color:
        "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600",
      action: handleBookmark,
    },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      {/* Quick Action Buttons */}
      <div className="flex flex-col-reverse space-y-reverse space-y-4 mb-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          const isActive = activeAction === action.id;
          return (
            <div
              key={action.id}
              className={`transform transition-all duration-300 ease-out ${
                isExpanded
                  ? "translate-y-0 opacity-100 scale-100"
                  : "translate-y-4 opacity-0 scale-95 pointer-events-none"
              }`}
              style={{
                transitionDelay: isExpanded
                  ? `${index * 75}ms`
                  : `${(quickActions.length - index - 1) * 50}ms`,
              }}
            >
              <div className="flex items-center space-x-4">
                {/* Label */}
                <div
                  className={`bg-white/95 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-full shadow-lg text-sm font-medium whitespace-nowrap border border-gray-200/50 transition-all duration-300 ${
                    isExpanded
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-8 pointer-events-none"
                  }`}
                  style={{
                    transitionDelay: isExpanded
                      ? `${index * 75 + 100}ms`
                      : "0ms",
                  }}
                >
                  {action.label}
                </div>

                {/* Action Button */}
                <button
                  onClick={action.action}
                  className={`${action.color} ${
                    isActive
                      ? "scale-125 shadow-2xl"
                      : "hover:scale-110 shadow-lg hover:shadow-xl"
                  } transition-all duration-300 ease-out text-white p-4 rounded-2xl relative overflow-hidden group`}
                  title={action.label}
                >
                  <Icon
                    size={22}
                    className={`${
                      isActive ? "animate-bounce" : "group-hover:rotate-12"
                    } transition-transform duration-200`}
                  />

                  {/* Ripple effect */}
                  {isActive && (
                    <div className="absolute inset-0 bg-white/30 rounded-2xl animate-ping"></div>
                  )}

                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Toggle Button */}
      <button
        onClick={toggleQuickMenu}
        className={`bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white p-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-out relative overflow-hidden group ${
          isExpanded ? "rotate-45 scale-110" : "hover:rotate-12 hover:scale-105"
        }`}
        title={isExpanded ? "Close Quick Menu" : "Quick Actions"}
      >
        <Zap
          size={26}
          className={`${
            isExpanded ? "animate-pulse" : "group-hover:animate-pulse"
          } transition-all duration-200`}
        />

        {/* Pulse indicator */}
        <div
          className={`absolute inset-0 bg-blue-400/50 rounded-2xl transition-all duration-500 ${
            isExpanded ? "scale-150 opacity-0" : "scale-0 opacity-50"
          }`}
        ></div>

        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
      </button>

      {/* Background overlay when expanded */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm -z-10 transition-opacity duration-300"
          onClick={toggleQuickMenu}
        />
      )}
    </div>
  );
};
