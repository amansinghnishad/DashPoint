import { ToastIcon } from "./components/ToastIcon";
import { ToastMessage } from "./components/ToastMessage";
import { ToastCloseButton } from "./components/ToastCloseButton";
import { useToast } from "./hooks/useToast";
import {
  getToastStyles,
  getToastAnimationClasses,
  TOAST_TYPES,
} from "./utils/toastHelpers";

export const Toast = ({
  message,
  type = TOAST_TYPES.INFO,
  duration = 4000,
  onClose,
}) => {
  const { isVisible, isEntering, handleClose } = useToast(duration, onClose);

  return (
    <div
      className={`
        ${getToastStyles(type)}
        transition-all duration-300 ease-out
        ${getToastAnimationClasses(isVisible, isEntering)}
      `}
    >
      <div className="flex-shrink-0">
        <ToastIcon type={type} />
      </div>

      <ToastMessage message={message} />

      <ToastCloseButton onClose={handleClose} />
    </div>
  );
};
