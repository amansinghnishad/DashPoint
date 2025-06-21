export const Select = ({
  value,
  onChange,
  options = [],
  placeholder = "Select an option...",
  className = "",
  disabled = false,
  required = false,
  ...props
}) => {
  const baseClasses =
    "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white";
  const disabledClasses =
    "disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <select
      value={value}
      onChange={onChange}
      className={`${baseClasses} ${disabledClasses} ${className}`}
      disabled={disabled}
      required={required}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};
