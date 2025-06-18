export const TodoFilters = ({
  filter,
  setFilter,
  activeCount,
  completedCount,
  totalCount,
}) => {
  const filters = [
    { key: "all", label: "All", icon: "📋" },
    { key: "active", label: "Active", icon: "⏳" },
    { key: "completed", label: "Completed", icon: "✅" },
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Stats */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-xl border border-blue-200">
          <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
          <span className="font-semibold">{activeCount} active</span>
        </div>
        <div className="flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-xl border border-green-200">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
          <span className="font-semibold">{completedCount} completed</span>
        </div>
        <div className="flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-xl border border-gray-200">
          <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
          <span className="font-semibold">{totalCount} total</span>
        </div>
      </div>

      {/* Enhanced Filter buttons */}
      <div className="flex flex-wrap gap-3">
        {filters.map((filterOption) => (
          <button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              filter === filterOption.key
                ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg transform scale-105"
                : "bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-gray-50 border border-gray-200/50 hover:border-gray-300/50"
            }`}
          >
            <span className="text-sm">{filterOption.icon}</span>
            <span>{filterOption.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
