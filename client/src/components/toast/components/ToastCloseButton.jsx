import { X } from "lucide-react";

export const ToastCloseButton = ({ onClose }) => {
  return (
    <button
      onClick={onClose}
      className="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
    >
      <X size={16} />
    </button>
  );
};
