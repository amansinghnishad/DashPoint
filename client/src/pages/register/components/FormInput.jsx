import { Eye, EyeOff } from "lucide-react";

export const FormInput = ({
  id,
  name,
  type = "text",
  label,
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  autoComplete,
  showPasswordToggle = false,
  showPassword = false,
  onTogglePassword,
  required = false,
  compact = false,
}) => {
  const inputType = showPasswordToggle
    ? showPassword
      ? "text"
      : "password"
    : type;

  return (
    <div>
      <label
        htmlFor={id}
        className={`block text-sm font-medium text-gray-700 ${
          compact ? "mb-1" : "mb-2"
        }`}
      >
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          id={id}
          name={name}
          type={inputType}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={onChange}
          className={`block w-full ${Icon ? "pl-10" : "pl-3"} ${
            showPasswordToggle ? "pr-10" : "pr-3"
          } ${
            compact ? "py-2" : "py-3"
          } border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
            error ? "border-red-300 bg-red-50" : "border-gray-300"
          }`}
          placeholder={placeholder}
        />
        {showPasswordToggle && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={onTogglePassword}
              className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
          {error}
        </p>
      )}
    </div>
  );
};
