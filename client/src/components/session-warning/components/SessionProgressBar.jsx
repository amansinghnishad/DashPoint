import {
  getProgressPercentage,
  getProgressBarColor,
} from "../utils/sessionHelpers";

export const SessionProgressBar = ({ countdown, totalTime = 300 }) => {
  const percentage = getProgressPercentage(countdown, totalTime);
  const colorClass = getProgressBarColor(percentage);

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${colorClass} h-2 rounded-full transition-all duration-1000`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};
