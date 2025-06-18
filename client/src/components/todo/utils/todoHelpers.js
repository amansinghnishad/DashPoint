export const filterTodos = (todos, filter) => {
  switch (filter) {
    case "active":
      return todos.filter((todo) => !todo.completed);
    case "completed":
      return todos.filter((todo) => todo.completed);
    default:
      return todos;
  }
};

export const getTodoStats = (todos) => {
  const activeCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.filter((todo) => todo.completed).length;

  return {
    activeCount,
    completedCount,
    totalCount: todos.length
  };
};

export const priorityColors = {
  low: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200",
  medium: "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200",
  high: "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200",
};
