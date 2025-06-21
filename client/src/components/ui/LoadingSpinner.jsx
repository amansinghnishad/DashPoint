import { Loader2 } from "lucide-react";

export const LoadingSpinner = ({
  size = "md",
  text = "",
  className = "",
  centered = false,
}) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const Spinner = () => (
    <div
      className={`flex items-center gap-2 ${
        centered ? "justify-center" : ""
      } ${className}`}
    >
      <Loader2 className={`animate-spin text-blue-600 ${sizes[size]}`} />
      {text && (
        <span className={`text-gray-600 ${textSizes[size]}`}>{text}</span>
      )}
    </div>
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center p-4">
        <Spinner />
      </div>
    );
  }

  return <Spinner />;
};

// Full page loading overlay
export const LoadingOverlay = ({ text = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <LoadingSpinner size="xl" text={text} />
    </div>
  );
};
