import { formatDateTime } from "../../../utils/dateUtils";

export const WeatherFooter = () => {
  return (
    <div className="mt-4 pt-4 border-t border-white/20">
      <p className="text-xs opacity-75 text-center">
        Last updated: {formatDateTime(new Date(), "HH:mm")}
      </p>
    </div>
  );
};
