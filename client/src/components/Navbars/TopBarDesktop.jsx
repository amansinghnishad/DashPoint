import { NavLink } from "react-router-dom";
import { Moon, Sun } from "lucide-react";

export default function TopBarDesktop({
  navItemClass,
  activeNavLinkClass,
  scrollToSection,
  authCta,
  theme,
  onToggleTheme,
  themeButtonClass,
}) {
  return (
    <div className="hidden md:flex items-center gap-8">
      <button
        type="button"
        onClick={() => scrollToSection("features")}
        className={navItemClass}
      >
        Features
      </button>
      <button
        type="button"
        onClick={() => scrollToSection("showcase")}
        className={navItemClass}
      >
        Demo
      </button>
      <button
        type="button"
        onClick={() => scrollToSection("pricing")}
        className={navItemClass}
      >
        Pricing
      </button>

      {authCta.secondary ? (
        <NavLink
          to={authCta.secondary.to}
          className={({ isActive }) =>
            `${navItemClass} ${isActive ? activeNavLinkClass : ""}`
          }
        >
          {authCta.secondary.label}
        </NavLink>
      ) : null}

      {authCta.primary ? (
        <NavLink
          to={authCta.primary.to}
          className="dp-btn-hero px-6 py-2 rounded-full transition-colors duration-300 font-semibold"
        >
          {authCta.primary.label}
        </NavLink>
      ) : null}

      <button
        type="button"
        onClick={onToggleTheme}
        className={themeButtonClass}
        aria-label={
          theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
        }
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </div>
  );
}
