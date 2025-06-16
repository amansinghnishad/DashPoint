import { X, Folder } from "lucide-react";

export const ModalHeader = ({ itemTitle, onClose }) => {
  return (
    <div className="flex justify-between items-center p-4 border-b border-gray-200">
      <div className="flex items-center space-x-2">
        <Folder size={20} className="text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Add to Collection
        </h2>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 p-1 rounded"
      >
        <X size={20} />
      </button>
    </div>
  );
};
