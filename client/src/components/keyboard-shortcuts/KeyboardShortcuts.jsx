import { ShortcutsModal } from "./components/ShortcutsModal";
import { ShortcutCategory } from "./components/ShortcutCategory";
import { shortcutsData } from "./data/shortcuts";

export const KeyboardShortcuts = ({ isOpen, onClose }) => {
  return (
    <ShortcutsModal isOpen={isOpen} onClose={onClose}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {shortcutsData.map((category, index) => (
          <ShortcutCategory
            key={index}
            category={category.category}
            items={category.items}
          />
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Pro Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Most shortcuts work globally across all tabs</li>
          <li>• Use Ctrl+K for quick search and navigation</li>
          <li>• Escape key closes most modals and panels</li>
          <li>• Hold Shift while clicking to select multiple items</li>
        </ul>
      </div>
    </ShortcutsModal>
  );
};
