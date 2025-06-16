import { Plus } from "lucide-react";

export const TodoHeader = ({ onToggleForm, showForm }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-bold text-gray-900">Todo List</h2>
      <button
        onClick={onToggleForm}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center space-x-2"
      >
        <Plus size={16} />
        <span>Add Todo</span>
      </button>
    </div>
  );
};
