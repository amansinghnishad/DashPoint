export const Textarea = ({
  value,
  onChange,
  placeholder = "",
  className = "",
  disabled = false,
  required = false,
  rows = 3,
  resize = "none",
  ...props
}) => {
  const baseClasses =
    "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200";
  const disabledClasses =
    "disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50";
  const resizeClass =
    resize === "none"
      ? "resize-none"
      : resize === "vertical"
      ? "resize-y"
      : resize === "horizontal"
      ? "resize-x"
      : "resize";

  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`${baseClasses} ${disabledClasses} ${resizeClass} ${className}`}
      disabled={disabled}
      required={required}
      rows={rows}
      {...props}
    />
  );
};
