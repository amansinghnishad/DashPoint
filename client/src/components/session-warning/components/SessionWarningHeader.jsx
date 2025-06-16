import { AlertTriangle } from "lucide-react";
import { formatCountdownTime } from "../utils/sessionHelpers";

export const SessionWarningHeader = ({ countdown }) => {
  return (
    <div className="flex items-center space-x-3 mb-4">
      <div className="flex-shrink-0">
        <AlertTriangle className="h-8 w-8 text-yellow-500" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Session Expiring Soon
        </h3>
        <p className="text-sm text-gray-600">
          Your session will expire in {formatCountdownTime(countdown)}
        </p>
      </div>
    </div>
  );
};
