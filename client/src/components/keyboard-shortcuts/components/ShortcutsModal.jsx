import { Keyboard } from "lucide-react";
import { Modal } from "../../ui";

export const ShortcutsModal = ({ isOpen, onClose, children }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" showCloseButton={true}>
      {/* Header */}
      <div className="flex items-center space-x-2 sm:space-x-3 p-4 sm:p-6 border-b border-gray-200">
        <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
          <Keyboard size={18} className="text-blue-600 sm:hidden" />
          <Keyboard size={24} className="text-blue-600 hidden sm:block" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
            Keyboard Shortcuts
          </h2>
          <p className="text-sm sm:text-base text-gray-600 hidden sm:block">
            Learn shortcuts to boost your productivity
          </p>
          <p className="text-xs text-gray-600 sm:hidden">
            Boost your productivity
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 keyboard-shortcuts-content">{children}</div>

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs sm:text-sm text-gray-600 text-center">
          Press{" "}
          <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-300 rounded shadow">
            Escape
          </kbd>{" "}
          or tap outside to close
        </div>
      </div>
    </Modal>
  );
};
