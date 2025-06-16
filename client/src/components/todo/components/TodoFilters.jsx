export const TodoFilters = ({
  filter,
  setFilter,
  activeCount,
  completedCount,
  totalCount,
}) => {
  const filters = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex space-x-4 text-sm text-gray-600">
        <span>{activeCount} active</span>
        <span>{completedCount} completed</span>
        <span>{totalCount} total</span>
      </div>

      {/* Filter buttons */}
      <div className="flex space-x-2">
        {filters.map((filterOption) => (
          <button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key)}
            className={`px-3 py-1 text-sm rounded-full ${
              filter === filterOption.key
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {filterOption.label}
          </button>
        ))}
      </div>
    </div>
  );
};
