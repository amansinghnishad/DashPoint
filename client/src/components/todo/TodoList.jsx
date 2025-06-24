import { useState } from "react";
import { Plus } from "lucide-react";
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
import "./todo.css";

export const TodoList = () => {
  const { todos, saveTodo, deleteTodo, toggleTodo } = useDashboard();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [showAddToCollectionModal, setShowAddToCollectionModal] =
    useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [isCreatingTodo, setIsCreatingTodo] = useState(false);
  const { success } = useToast();

  const handleAddTodo = async (todo) => {
    if (isCreatingTodo) return; // Prevent duplicate creation

    setIsCreatingTodo(true);
    try {
      await saveTodo(todo);
      setShowForm(false);
    } catch (error) {
      console.error("Failed to create todo:", error);
    } finally {
      setIsCreatingTodo(false);
    }
  };

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
    <div className="todo-list min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section with Glassmorphism */}
        <div className="backdrop-blur-sm bg-white/80 rounded-xl sm:rounded-2xl border border-white/20 shadow-xl p-4 sm:p-8 mb-4 sm:mb-8">
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
          <div className="mb-4 sm:mb-8 animate-fade-in-up">
            <TodoForm
              onAdd={handleAddTodo}
              onCancel={() => setShowForm(false)}
              isCreating={isCreatingTodo}
            />
          </div>
        )}

        {/* Todo List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredTodos.length === 0 ? (
            <div className="backdrop-blur-sm bg-white/80 rounded-xl sm:rounded-2xl border border-white/20 shadow-xl p-6 sm:p-12 text-center">
              <div className="mb-4 sm:mb-8">
                <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6">
                  <span className="text-4xl sm:text-6xl">✅</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                  {filter === "all"
                    ? "Ready to get productive?"
                    : `No ${filter} todos`}
                </h3>
                <p className="text-gray-600 text-sm sm:text-lg leading-relaxed max-w-md mx-auto">
                  {filter === "all"
                    ? "Create your first todo to start organizing your tasks"
                    : `You don't have any ${filter} todos at the moment`}
                </p>
              </div>
              {!showForm && filter === "all" && (
                <button
                  onClick={() => setShowForm(true)}
                  className="group inline-flex items-center space-x-2 sm:space-x-3 px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg sm:rounded-xl hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-sm sm:text-base touch-manipulation"
                >
                  <Plus
                    size={18}
                    className="group-hover:rotate-90 transition-transform duration-200 sm:hidden"
                  />
                  <Plus
                    size={20}
                    className="group-hover:rotate-90 transition-transform duration-200 hidden sm:block"
                  />
                  <span>Add Your First Todo</span>
                </button>
              )}
            </div>
          ) : (
            filteredTodos.map((todo, index) => (
              <div
                key={todo._id || todo.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <TodoItem
                  todo={todo}
                  onUpdate={saveTodo}
                  onDelete={deleteTodo}
                  onToggle={toggleTodo}
                  onAddToCollection={handleAddToCollection}
                />
              </div>
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
    </div>
  );
};
