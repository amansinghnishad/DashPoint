import React from "react";

export default function Button({
  children,
  variant = "primary",
  type = "button",
  className = "",
  onClick,
  disabled = false,
  btnFrom = "",
  ...props
}) {
  const baseStyle = "transition-all duration-200 active:scale-[0.98]";
  const pageBtnStyle = { "landingBtn": " px-7 py-3 rounded-xl font-medium", "dashBtn": "" }


  const variants = {
    primary: "dp-btn-primary",
    secondary: "dp-btn-secondary",
    hero: "dp-btn-hero",
    icon: "dp-btn-icon",
  };

  const variantStyle = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variantStyle} ${baseStyle} ${className} ${pageBtnStyle[btnFrom]}`}
      {...props}
    >
      {children}
    </button>
  );
}
