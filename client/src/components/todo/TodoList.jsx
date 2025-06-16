import { useState } from "react";
import { useDashboard } from "../../context/DashboardContext";
import { AddToCollectionModal } from "../add-to-collection-modal/AddToCollectionModal";
import { useToast } from "../../hooks/useToast";
import {
  TodoItem,
  TodoForm,
  TodoFilters,
  TodoHeader,
  filterTodos,
  getTodoStats,
} from "./index";

export const TodoList = () => {
  const { todos, saveTodo, deleteTodo, toggleTodo } = useDashboard();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [showAddToCollectionModal, setShowAddToCollectionModal] =
    useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const { success } = useToast();

  const handleAddToCollection = (todo) => {
    setSelectedTodo(todo);
    setShowAddToCollectionModal(true);
  };

  const handleCollectionAdded = () => {
    setShowAddToCollectionModal(false);
    setSelectedTodo(null);
    success("Todo added to collection successfully");
  };

  const filteredTodos = filterTodos(todos, filter);
  const { activeCount, completedCount, totalCount } = getTodoStats(todos);

  return (
    <div className="todo-list max-w-2xl mx-auto p-4">
      <div className="mb-6">
        <TodoHeader
          onToggleForm={() => setShowForm(!showForm)}
          showForm={showForm}
        />

        <TodoFilters
          filter={filter}
          setFilter={setFilter}
          activeCount={activeCount}
          completedCount={completedCount}
          totalCount={totalCount}
        />
      </div>

      {/* Add Todo Form */}
      {showForm && (
        <div className="mb-6">
          <TodoForm
            onAdd={(todo) => {
              saveTodo(todo);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Todo List */}
      <div className="space-y-3">
        {filteredTodos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No todos found.</p>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                Add Your First Todo
              </button>
            )}
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <TodoItem
              key={todo._id || todo.id}
              todo={todo}
              onUpdate={saveTodo}
              onDelete={deleteTodo}
              onToggle={toggleTodo}
              onAddToCollection={handleAddToCollection}
            />
          ))
        )}
      </div>

      {/* Add to Collection Modal */}
      {showAddToCollectionModal && selectedTodo && (
        <AddToCollectionModal
          isOpen={showAddToCollectionModal}
          onClose={() => setShowAddToCollectionModal(false)}
          itemType="todo"
          itemId={selectedTodo._id || selectedTodo.id}
          onSuccess={handleCollectionAdded}
        />
      )}
    </div>
  );
};
