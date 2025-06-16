import { getToastIcon } from "../utils/toastHelpers";

export const ToastIcon = ({ type, size = 20 }) => {
  const IconComponent = getToastIcon(type);
  return <IconComponent size={size} />;
};
