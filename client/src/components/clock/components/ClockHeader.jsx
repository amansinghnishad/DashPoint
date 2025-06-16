import { Clock as ClockIcon, Settings } from "lucide-react";

export const ClockHeader = ({ onSettingsToggle }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center space-x-2">
        <ClockIcon size={20} />
        <span className="font-medium">Clock</span>
      </div>

      <button
        onClick={onSettingsToggle}
        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
        title="Settings"
      >
        <Settings size={16} />
      </button>
    </div>
  );
};
