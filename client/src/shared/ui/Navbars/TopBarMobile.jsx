import { Link } from "react-router-dom";
import { IconClose, IconMenu, Moon, Sun } from "@/shared/ui/icons";

export default function TopBarMobile({
  themeButtonClass,
  theme,
  onToggleTheme,
  toggleMenu,
  isMenuOpen,
  menuId,
  setIsMenuOpen,
  scrollToSection,
  logoSrc,
  authCta,
}) {
  const drawerItemClass =
    "text-white hover:text-amber-300 transition-colors duration-300";
  const drawerSecondaryClass =
    "text-white/80 hover:text-white transition-colors duration-300";

  return (
    <>
      {!isMenuOpen ? (
        <div className="md:hidden flex items-center gap-4">
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
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            type="button"
            onClick={toggleMenu}
            className={themeButtonClass}
            aria-expanded={false}
            aria-controls={menuId}
            aria-label="Open menu"
          >
            <IconMenu size={20} />
          </button>
        </div>
      ) : null}

      <div id={menuId} className="md:hidden">
        {isMenuOpen ? (
          <div
            className="fixed inset-0 z-50"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <button
              type="button"
              className="absolute inset-0 dp-overlay-bg"
              aria-label="Close menu"
              onClick={() => setIsMenuOpen(false)}
            />

            <div className="absolute inset-4 dp-sidebar-surface dp-border border rounded-3xl shadow-2xl px-6 py-6 flex flex-col">
              <div className="flex items-center justify-between">
                <Link
                  to="/"
                  className="flex items-center"
                  aria-label="DashPoint"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <img src={logoSrc} alt="DashPoint Logo" className="h-10" />
                </Link>

                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className={themeButtonClass}
                  aria-label="Close menu"
                >
                  <IconClose size={20} />
                </button>
              </div>

              <div className="mt-8 flex flex-col gap-4">
                <Link
                  to="/"
                  className={`${drawerItemClass} text-left`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>

                <button
                  type="button"
                  onClick={() => scrollToSection("features")}
                  className={`${drawerItemClass} text-left`}
                >
                  Features
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection("showcase")}
                  className={`${drawerItemClass} text-left`}
                >
                  Demo
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection("pricing")}
                  className={`${drawerItemClass} text-left`}
                >
                  Pricing
                </button>
              </div>

              <div className="mt-auto pt-10">
                {authCta.primary ? (
                  <Link
                    to={authCta.primary.to}
                    onClick={() => setIsMenuOpen(false)}
                    className="dp-btn-hero w-full inline-flex items-center justify-center rounded-xl py-3 font-semibold"
                  >
                    {authCta.primary.label}
                  </Link>
                ) : null}

                {authCta.secondary ? (
                  <div className="mt-4 text-center">
                    <Link
                      to={authCta.secondary.to}
                      onClick={() => setIsMenuOpen(false)}
                      className={drawerSecondaryClass}
                    >
                      {authCta.secondary.label}
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
