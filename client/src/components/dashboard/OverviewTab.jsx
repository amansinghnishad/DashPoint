import { StickyNote, CheckSquare, Upload, Cloud } from "lucide-react";
import { ActivityFeed } from "./ActivityFeed";
import { Weather } from "../../components/weather/index";
import { Clock } from "../../components/clock/index";

export const OverviewTab = () => {
  return (
    <>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-sm text-white p-8">
          <h2 className="text-3xl font-bold mb-4">Welcome to Your Dashboard</h2>
          <p className="text-blue-100 mb-6 text-lg">
            Your personal productivity hub with everything you need in one
            place.
          </p>
          <div className="flex space-x-4">
            <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Get Started
            </button>
            <button className="border border-white text-white px-6 py-2 rounded-lg font-semibold hover:bg-white hover:bg-opacity-10 transition-colors">
              Learn More
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">47</p>
                <p className="text-sm text-green-600">Stay organized</p>
              </div>
              <CheckSquare className="text-green-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Notes Created</p>
                <p className="text-2xl font-bold text-gray-900">23</p>
                <p className="text-sm text-blue-600">Keep track of ideas</p>
              </div>
              <StickyNote className="text-blue-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Files Uploaded</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-sm text-purple-600">Manage your files</p>
              </div>
              <Upload className="text-purple-500" size={32} />
            </div>
          </div>{" "}
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
