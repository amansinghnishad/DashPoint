import {
  StickyNote,
  CheckSquare,
  Upload,
  Cloud,
  Folder,
  RefreshCw,
} from "lucide-react";
import { Button } from "../../../components/ui";
import { ActivityFeed } from "./ActivityFeed";
import { Weather } from "../../../components/weather/index";
import { Clock } from "../../../components/clock/index";
import { useDashboard } from "../../../context/DashboardContext";
import { useAuth } from "../../../context/AuthContext";
import { useEffect } from "react";

export const OverviewTab = () => {
  const { stickyNotes, todos, stats, loading, loadStats } = useDashboard();
  const { user } = useAuth();

  // Refresh stats when component mounts
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Calculate real stats
  const totalTasks = todos.length;
  const completedTasks = todos.filter((todo) => todo.completed).length;
  const totalNotes = stickyNotes.length;

  return (
    <>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-sm text-white p-8">
          <h2 className="text-3xl font-bold mb-4">
            Welcome back{user?.username ? `, ${user.username}` : ""}!
          </h2>
          <p className="text-blue-100 mb-6 text-lg">
            Your personal productivity hub with everything you need in one
            place.
          </p>{" "}
          <div className="flex space-x-4">
            <Button
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              Get Started
            </Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:bg-opacity-10"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
          <button
            onClick={() => {
              loadStats();
            }}
            className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={loading.stats}
          >
            <RefreshCw
              size={16}
              className={loading.stats ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <div className="text-2xl font-bold text-gray-900">
                  {loading.todos ? (
                    <div className="h-8 w-12 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    totalTasks
                  )}
                </div>
                <p className="text-sm text-green-600">
                  {completedTasks > 0
                    ? `${completedTasks} completed`
                    : "Stay organized"}
                </p>
              </div>
              <CheckSquare className="text-green-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sticky Notes</p>
                <div className="text-2xl font-bold text-gray-900">
                  {loading.stickyNotes ? (
                    <div className="h-8 w-12 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    totalNotes
                  )}
                </div>
                <p className="text-sm text-blue-600">Keep track of ideas</p>
              </div>
              <StickyNote className="text-blue-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Collections</p>{" "}
                <div className="text-2xl font-bold text-gray-900">
                  {loading.stats ? (
                    <div className="h-8 w-12 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    stats.collections || 0
                  )}
                </div>
                <p className="text-sm text-purple-600">Organize your content</p>
              </div>
              <Folder className="text-purple-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Saved Content</p>{" "}
                <div className="text-2xl font-bold text-gray-900">
                  {loading.stats ? (
                    <div className="h-8 w-12 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    (stats.content || 0) + (stats.videos || 0)
                  )}
                </div>
                <p className="text-sm text-indigo-600">Articles & videos</p>
              </div>
              <Upload className="text-indigo-500" size={32} />
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityFeed limit={6} />

          {/* Weather and Clock Widgets */}
          <div className="space-y-6">
            <Weather />
            <Clock />
          </div>
        </div>
      </div>
    </>
  );
};
