import {
  Activity,
  StickyNote,
  CheckCircle,
  Cloud,
  Youtube,
  FileText,
  Folder,
} from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";

const getActivityIcon = (type) => {
  switch (type) {
    case "note":
      return StickyNote;
    case "todo":
      return CheckCircle;
    case "weather":
      return Cloud;
    case "youtube":
      return Youtube;
    case "content":
      return FileText;
    case "collection":
      return Folder;
    default:
      return Activity;
  }
};

const getActivityColor = (type) => {
  switch (type) {
    case "note":
      return "text-blue-600";
    case "todo":
      return "text-green-600";
    case "weather":
      return "text-sky-600";
    case "youtube":
      return "text-red-600";
    case "content":
      return "text-purple-600";
    case "collection":
      return "text-orange-600";
    default:
      return "text-gray-600";
  }
};

export const ActivityFeed = ({ limit = 5 }) => {
  const { getRecentActivities } = useDashboard();
  const activities = getRecentActivities(limit);

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Activity
          </h3>
          <Activity className="text-gray-400" size={20} />
        </div>
        <div className="text-center py-8">
          <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No recent activity</p>
          <p className="text-sm text-gray-400 mt-1">
            Start using the dashboard to see your activity here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <Activity className="text-gray-400" size={20} />
      </div>
      <div className="space-y-3">
        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          const colorClass = getActivityColor(activity.type);
          return (
            <div
              key={activity.id || index}
              className="flex items-start space-x-3"
            >
              <div className="bg-gray-100 p-2 rounded-full">
                <Icon size={16} className={colorClass} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">
                  {activity.text}
                </p>
                <p className="text-xs text-gray-500">
                  {activity.timeFormatted}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {activities.length >= limit && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Showing last {limit} activities
          </p>
        </div>
      )}
    </div>
  );
};
