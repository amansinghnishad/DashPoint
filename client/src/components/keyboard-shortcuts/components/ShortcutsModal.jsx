import { Keyboard } from "lucide-react";
import { Modal } from "../../ui";

export const ShortcutsModal = ({ isOpen, onClose, children }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-4xl"
      showCloseButton={true}
    >
      {/* Header */}
      <div className="flex items-center space-x-3 p-6 border-b border-gray-200">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Keyboard size={24} className="text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Keyboard Shortcuts
          </h2>
          <p className="text-gray-600">
            Learn shortcuts to boost your productivity
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">{children}</div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-600 text-center">
          Press{" "}
          <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-300 rounded shadow">
            Escape
          </kbd>{" "}
          or click outside to close
        </div>
      </div>
    </Modal>
  );
};
