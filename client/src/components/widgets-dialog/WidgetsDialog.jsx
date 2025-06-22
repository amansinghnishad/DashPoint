import { useState } from "react";
import {
  X,
  Grid3X3,
  StickyNote,
  CheckSquare,
  Clock,
  Cloud,
} from "lucide-react";
import { StickyNotesContainer } from "../sticky-notes";
import { TodoList } from "../todo";
import { Clock as ClockComponent } from "../clock";
import { Weather } from "../weather";

export const WidgetsDialog = ({ isOpen, onClose, isDark }) => {
  const [activeWidget, setActiveWidget] = useState("sticky-notes");

  const widgets = [
    {
      id: "sticky-notes",
      label: "Sticky Notes",
      icon: StickyNote,
      component: StickyNotesContainer,
    },
    {
      id: "todo",
      label: "Todo",
      icon: CheckSquare,
      component: TodoList,
    },
    {
      id: "clock",
      label: "Clock",
      icon: Clock,
      component: ClockComponent,
    },
    {
      id: "weather",
      label: "Weather",
      icon: Cloud,
      component: Weather,
    },
  ];

  const ActiveWidgetComponent = widgets.find(
    (w) => w.id === activeWidget
  )?.component;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-4 md:inset-8 lg:inset-16 z-50 flex items-center justify-center">
        <div
          className={`w-full max-w-6xl h-full max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
            isDark
              ? "bg-gray-800/95 backdrop-blur-sm border border-gray-700"
              : "bg-white/95 backdrop-blur-sm border border-gray-200"
          }`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between p-6 border-b ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            {" "}
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
                <Grid3X3 size={20} className="text-white" />
              </div>
              <h2
                className={`text-xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Widgets Dashboard
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
                isDark
                  ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              }`}
              aria-label="Close widgets dialog"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex h-full">
            {/* Widget Tabs */}
            <div
              className={`w-64 border-r overflow-y-auto scrollable-area ${
                isDark
                  ? "border-gray-700 bg-gray-800/50"
                  : "border-gray-200 bg-gray-50/50"
              }`}
            >
              <div className="p-4">
                <h3
                  className={`text-sm font-semibold mb-3 ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Available Widgets
                </h3>
                <div className="space-y-2">
                  {widgets.map((widget) => {
                    const Icon = widget.icon;
                    const isActive = activeWidget === widget.id;
                    return (
                      <button
                        key={widget.id}
                        onClick={() => setActiveWidget(widget.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                          isActive
                            ? isDark
                              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                              : "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 shadow-sm"
                            : isDark
                            ? "text-gray-300 hover:bg-gray-700/80 hover:text-white"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <Icon size={18} />
                        <span className="font-medium">{widget.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Widget Content */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto scrollable-area p-6">
                {ActiveWidgetComponent && (
                  <div className="h-full">
                    <ActiveWidgetComponent />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
