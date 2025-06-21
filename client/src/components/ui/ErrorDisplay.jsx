import { AlertCircle, XCircle, AlertTriangle, Info } from "lucide-react";

export const ErrorDisplay = ({
  error,
  type = "error",
  title,
  message,
  onRetry,
  onDismiss,
  className = "",
}) => {
  // Don't render if there's no error and no message
  if (!error && !message) return null;

  // Use error as message if message is not provided
  const displayMessage = message || error;

  const types = {
    error: {
      icon: XCircle,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-800",
      iconColor: "text-red-500",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-800",
      iconColor: "text-yellow-500",
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-800",
      iconColor: "text-blue-500",
    },
  };

  const config = types[type] || types.error;
  const Icon = config.icon;

  return (
    <div
      className={`rounded-lg border p-4 ${config.bgColor} ${config.borderColor} ${className}`}
    >
      <div className="flex">
        <Icon className={`h-5 w-5 ${config.iconColor} mt-0.5`} />
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${config.textColor}`}>
              {title}
            </h3>
          )}
          {displayMessage && (
            <div
              className={`${title ? "mt-1" : ""} text-sm ${config.textColor}`}
            >
              {typeof displayMessage === "string" ? (
                <p>{displayMessage}</p>
              ) : (
                displayMessage
              )}
            </div>
          )}
          {(onRetry || onDismiss) && (
            <div className="mt-3 flex gap-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={`text-sm font-medium underline hover:no-underline ${config.textColor}`}
                >
                  Try again
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className={`text-sm font-medium underline hover:no-underline ${config.textColor}`}
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// For displaying multiple errors (like form validation)
export const ErrorList = ({ errors, className = "" }) => {
  if (!errors || errors.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {errors.map((error, index) => (
        <ErrorDisplay key={index} type="error" message={error} />
      ))}
    </div>
  );
};
