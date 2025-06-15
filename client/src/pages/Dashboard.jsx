import { useState } from "react";
import {
  Home,
  StickyNote,
  CheckSquare,
  Youtube,
  FileText,
  Cloud,
  Clock as ClockIcon,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  Folder,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { StickyNotes } from "../components/StickyNotes";
import { TodoList } from "../components/TodoList";
import { YouTubePlayer } from "../components/YouTubePlayer";
import { ContentExtractor } from "../components/ContentExtractor";
import { Weather } from "../components/Weather";
import { Clock } from "../components/Clock";
import { Collections } from "../components/Collections";

const Sidebar = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const { user, logoutUser } = useAuth();
  const menuItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "collections", label: "Collections", icon: Folder },
    { id: "sticky-notes", label: "Sticky Notes", icon: StickyNote },
    { id: "todos", label: "Todo List", icon: CheckSquare },
    { id: "youtube", label: "YouTube", icon: Youtube },
    { id: "content", label: "Content Extractor", icon: FileText },
    { id: "weather", label: "Weather", icon: Cloud },
    { id: "clock", label: "Clock", icon: ClockIcon },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
              <button
                onClick={onClose}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === item.id
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">
                <Settings size={16} />
                <span>Settings</span>
              </button>
              <button
                onClick={logoutUser}
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const OverviewTab = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to Your Dashboard
        </h2>
        <p className="text-gray-600 mb-6">
          Your personal productivity hub with everything you need in one place.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <StickyNote className="text-blue-500 mb-2" size={24} />
            <h3 className="font-semibold text-gray-900">Sticky Notes</h3>
            <p className="text-sm text-gray-600">Quick notes and reminders</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <CheckSquare className="text-green-500 mb-2" size={24} />
            <h3 className="font-semibold text-gray-900">Todo List</h3>
            <p className="text-sm text-gray-600">
              Manage your tasks efficiently
            </p>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <Youtube className="text-red-500 mb-2" size={24} />
            <h3 className="font-semibold text-gray-900">YouTube Player</h3>
            <p className="text-sm text-gray-600">Watch videos while working</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <FileText className="text-purple-500 mb-2" size={24} />
            <h3 className="font-semibold text-gray-900">Content Extractor</h3>
            <p className="text-sm text-gray-600">Extract text from websites</p>
          </div>

          <div className="bg-cyan-50 p-4 rounded-lg">
            <Cloud className="text-cyan-500 mb-2" size={24} />
            <h3 className="font-semibold text-gray-900">Weather</h3>
            <p className="text-sm text-gray-600">Current weather conditions</p>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg">
            <ClockIcon className="text-indigo-500 mb-2" size={24} />
            <h3 className="font-semibold text-gray-900">World Clock</h3>
            <p className="text-sm text-gray-600">Time zones and calendar</p>
          </div>
        </div>
      </div>

      {/* Quick Access Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Weather />
        <Clock />
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // renderContent function
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />;
      case "collections":
        return <Collections />;
      case "sticky-notes":
        return <StickyNotes />;
      case "todos":
        return <TodoList />;
      case "youtube":
        return <YouTubePlayer />;
      case "content":
        return <ContentExtractor />;
      case "weather":
        return <Weather />;
      case "clock":
        return <Clock />;
      default:
        return <OverviewTab />;
    }
  };
  const getPageTitle = () => {
    const titles = {
      overview: "Dashboard Overview",
      collections: "Collections",
      "sticky-notes": "Sticky Notes",
      todos: "Todo List",
      youtube: "YouTube Player",
      content: "Content Extractor",
      weather: "Weather",
      clock: "World Clock",
    };
    return titles[activeTab] || "Dashboard";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu size={20} />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {getPageTitle()}
              </h1>
            </div>

            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{renderContent()}</main>
      </div>
    </div>
  );
};
