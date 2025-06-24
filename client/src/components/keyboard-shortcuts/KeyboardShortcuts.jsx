import { ShortcutsModal } from "./components/ShortcutsModal";
import { ShortcutCategory } from "./components/ShortcutCategory";
import { shortcutsData } from "./data/shortcuts";

export const KeyboardShortcuts = ({ isOpen, onClose }) => {
  return (
    <ShortcutsModal isOpen={isOpen} onClose={onClose}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 keyboard-shortcuts-grid">
        {shortcutsData.map((category, index) => (
          <ShortcutCategory
            key={index}
            category={category.category}
            items={category.items}
          />
        ))}
      </div>

      <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 rounded-lg pro-tips-section">
        <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">
          💡 Pro Tips:
        </h4>
        <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
          <li>• Most shortcuts work globally across all tabs</li>
          <li>
            • Use{" "}
            <kbd className="px-1 py-0.5 text-xs bg-white border border-blue-300 rounded">
              Ctrl+K
            </kbd>{" "}
            for quick search and navigation
          </li>
          <li>
            •{" "}
            <kbd className="px-1 py-0.5 text-xs bg-white border border-blue-300 rounded">
              Escape
            </kbd>{" "}
            key closes most modals and panels
          </li>
          <li>
            • Hold{" "}
            <kbd className="px-1 py-0.5 text-xs bg-white border border-blue-300 rounded">
              Shift
            </kbd>{" "}
            while clicking to select multiple items
          </li>
        </ul>
      </div>
    </ShortcutsModal>
  );
};
