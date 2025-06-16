import {
  Activity,
  StickyNote,
  CheckCircle,
  Cloud,
  Youtube,
  FileText,
} from "lucide-react";

export const ActivityFeed = ({ limit = 5 }) => {
  const activities = [
    {
      type: "note",
      text: "Created new sticky note",
      time: "2 min ago",
      icon: StickyNote,
    },
    {
      type: "todo",
      text: "Completed 3 tasks",
      time: "5 min ago",
      icon: CheckCircle,
    },
    {
      type: "weather",
      text: "Checked weather for NYC",
      time: "10 min ago",
      icon: Cloud,
    },
    {
      type: "youtube",
      text: "Watched React tutorial",
      time: "1 hour ago",
      icon: Youtube,
    },
    {
      type: "content",
      text: "Extracted content from article",
      time: "2 hours ago",
      icon: FileText,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <Activity className="text-gray-400" size={20} />
      </div>
      <div className="space-y-3">
        {activities.slice(0, limit).map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div key={index} className="flex items-start space-x-3">
              <div className="bg-gray-100 p-2 rounded-full">
                <Icon size={16} className="text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.text}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
