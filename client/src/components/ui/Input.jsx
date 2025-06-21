import { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";

export const Input = forwardRef(
  (
    {
      label,
      error,
      type = "text",
      placeholder,
      value,
      onChange,
      disabled = false,
      required = false,
      className = "",
      icon,
      helperText,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState(false);

    const isPasswordType = type === "password";
    const inputType = isPasswordType && showPassword ? "text" : type;

    const baseStyles =
      "block w-full px-3 py-2 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0";

    const stateStyles = error
      ? "border-red-300 focus:border-red-400 focus:ring-red-500"
      : focused
      ? "border-blue-300 focus:border-blue-400 focus:ring-blue-500"
      : "border-gray-300 focus:border-blue-400 focus:ring-blue-500";

    const disabledStyles = disabled
      ? "bg-gray-50 text-gray-500 cursor-not-allowed"
      : "bg-white text-gray-900";

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">{icon}</span>
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            placeholder={placeholder}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`${baseStyles} ${stateStyles} ${disabledStyles} ${
              icon ? "pl-10" : ""
            } ${isPasswordType ? "pr-10" : ""} ${className}`}
            {...props}
          />

          {isPasswordType && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              disabled={disabled}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);
