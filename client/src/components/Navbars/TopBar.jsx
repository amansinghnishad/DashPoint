import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, Moon, Sun, X } from "lucide-react";
import useTheme from "../../hooks/useTheme";

const isReducedMotionPreferred = () => {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

const TopBar = () => {
  const navRef = useRef(null);
  const menuId = useId();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const logoSrc =
    theme === "dark" ? "/Dark-mode-logo.png" : "/Light-mode-logo.png";

  const isAuthPage = useMemo(() => {
    return location.pathname === "/login" || location.pathname === "/register";
  }, [location.pathname]);

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 50);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((v) => !v);
  }, []);

  const onToggleTheme = toggleTheme;

  const scrollToSection = useCallback((sectionId) => {
    const el = document.getElementById(sectionId);
    if (el)
      el.scrollIntoView({
        behavior: isReducedMotionPreferred() ? "auto" : "smooth",
      });
    setIsMenuOpen(false);
  }, []);

  const navClassName = useMemo(() => {
    const base = "fixed top-0 left-0 right-0 z-50 transition-all duration-300";
    const scrolled = isScrolled ? "shadow-md py-2" : "py-4";
    const bg = isScrolled
      ? "bg-slate-950/40 backdrop-blur-sm"
      : "bg-transparent";

    return `${base} ${bg} ${scrolled}`;
  }, [isScrolled]);

  const textClass = "text-white";
  const hoverClass = "hover:text-amber-300";
  const navItemClass = `${textClass} ${hoverClass} transition-colors duration-300`;
  const activeNavLinkClass = "text-amber-300";
  const themeButtonClass =
    "inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 p-2 text-white hover:bg-white/10 transition-colors duration-300";

  return (
    <nav ref={navRef} className={navClassName} aria-label="Primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center" aria-label="DashPoint">
            <img src={logoSrc} alt="DashPoint Logo" className="h-12 sm:h-14" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {isAuthPage ? (
              <>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `${navItemClass} ${isActive ? activeNavLinkClass : ""}`
                  }
                >
                  Home
                </NavLink>
                {location.pathname !== "/login" && (
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      `${navItemClass} ${isActive ? activeNavLinkClass : ""}`
                    }
                  >
                    Sign In
                  </NavLink>
                )}
                {location.pathname !== "/register" && (
                  <NavLink
                    to="/register"
                    className={`dp-btn-hero px-6 py-2 rounded-full transition-colors duration-300 font-semibold`}
                  >
                    Sign Up
                  </NavLink>
                )}

                <button
                  type="button"
                  onClick={onToggleTheme}
                  className={themeButtonClass}
                  aria-label={
                    theme === "dark"
                      ? "Switch to light theme"
                      : "Switch to dark theme"
                  }
                >
                  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </>
            ) : (
              <>
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

                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `${navItemClass} ${isActive ? activeNavLinkClass : ""}`
                  }
                >
                  Sign In
                </NavLink>

                <NavLink
                  to="/register"
                  className={`dp-btn-hero px-6 py-2 rounded-full transition-colors duration-300 font-semibold`}
                >
                  Start Free
                </NavLink>

                <button
                  type="button"
                  onClick={onToggleTheme}
                  className={themeButtonClass}
                  aria-label={
                    theme === "dark"
                      ? "Switch to light theme"
                      : "Switch to dark theme"
                  }
                >
                  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleTheme}
              className={themeButtonClass}
              aria-label={
                theme === "dark"
                  ? "Switch to light theme"
                  : "Switch to dark theme"
              }
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              type="button"
              onClick={toggleMenu}
              className={`${navItemClass}`}
              aria-expanded={isMenuOpen}
              aria-controls={menuId}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <div
          id={menuId}
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            isMenuOpen ? "max-h-screen opacity-100 mt-4" : "max-h-0 opacity-0"
          }`}
        >
          <div
            className={`${"bg-slate-950/60 backdrop-blur-sm"} p-4 space-y-4 rounded-xl`}
          >
            {isAuthPage ? (
              <>
                <NavLink
                  to="/"
                  className={navItemClass}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </NavLink>
                {location.pathname !== "/login" && (
                  <NavLink
                    to="/login"
                    className={navItemClass}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </NavLink>
                )}
                {location.pathname !== "/register" && (
                  <NavLink
                    to="/register"
                    className={`block dp-btn-hero px-6 py-2 rounded-full transition-colors duration-300 text-center font-semibold`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </NavLink>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className={`block w-full text-left ${navItemClass}`}
                  aria-label={
                    theme === "dark"
                      ? "Switch to light theme"
                      : "Switch to dark theme"
                  }
                >
                  <span className="inline-flex items-center gap-2">
                    {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                    Theme
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection("features")}
                  className={`block w-full text-left ${navItemClass}`}
                >
                  Features
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection("showcase")}
                  className={`block w-full text-left ${navItemClass}`}
                >
                  Demo
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection("pricing")}
                  className={`block w-full text-left ${navItemClass}`}
                >
                  Pricing
                </button>
                <NavLink
                  to="/login"
                  className={navItemClass}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </NavLink>
                <NavLink
                  to="/register"
                  className={`block dp-btn-hero px-6 py-2 rounded-full transition-colors duration-300 text-center font-semibold`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Start Free
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopBar;
