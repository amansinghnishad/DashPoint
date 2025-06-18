import { Plus } from "lucide-react";

export const TodoHeader = ({ onToggleForm, showForm }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      <div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-emerald-800 bg-clip-text text-transparent">
          Todo List
        </h2>
        <p className="text-gray-600 text-lg font-medium mt-1">
          Stay organized and get things done
        </p>
      </div>
      <button
        onClick={onToggleForm}
        className="group flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <Plus
          size={20}
          className={`${
            showForm ? "rotate-45" : "group-hover:rotate-90"
          } transition-transform duration-200`}
        />
        <span className="font-semibold">
          {showForm ? "Cancel" : "Add Todo"}
        </span>
      </button>
    </div>
  );
};
