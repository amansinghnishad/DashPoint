import { useEffect, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

import { APP_ROUTES } from "../../../app/routes/paths";

export default function TopBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAuthPage =
    location.pathname === APP_ROUTES.LOGIN || location.pathname === APP_ROUTES.REGISTER;

  const authCta = useMemo(() => {
    if (!isAuthPage) {
      return {
        secondary: { to: APP_ROUTES.LOGIN, label: "Sign In" },
        primary: { to: APP_ROUTES.REGISTER, label: "Try free" },
      };
    }
    if (location.pathname === APP_ROUTES.LOGIN) {
      return {
        secondary: null,
        primary: { to: APP_ROUTES.REGISTER, label: "Try free" },
      };
    }
    // /register
    return {
      secondary: { to: APP_ROUTES.LOGIN, label: "Sign In" },
      primary: null,
    };
  }, [isAuthPage, location.pathname]);

  return (
    <nav
      className={`fixed top-0 w-full z-50 flex justify-between items-center transition-all duration-500 px-xl md:px-xxl ${
        isScrolled
          ? "bg-white/80 backdrop-blur-lg h-16 border-b border-hairline"
          : "h-20"
      }`}
    >
      <div className="flex items-center gap-xl">
        <Link
          to={APP_ROUTES.HOME}
          className="font-waldenburg-light text-2xl tracking-tight text-ink"
        >
          DASHPOINT
        </Link>
        <div className="hidden md:flex gap-lg">
          <a
            href="/#capabilities"
            className="text-[15px] font-medium text-on-surface-variant hover:text-ink transition-colors"
          >
            Capabilities
          </a>
          <a
            href="/#manifesto"
            className="text-[15px] font-medium text-on-surface-variant hover:text-ink transition-colors"
          >
            Manifesto
          </a>
        </div>
      </div>
      <div className="flex items-center gap-base">
        {authCta.secondary ? (
          <Link
            to={authCta.secondary.to}
            className="hidden md:block text-[15px] font-medium text-on-surface-variant hover:text-ink transition-colors"
          >
            {authCta.secondary.label}
          </Link>
        ) : null}
        {authCta.primary ? (
          <Link
            to={authCta.primary.to}
            className="bg-ink text-canvas px-8 py-2.5 rounded-full text-[15px] font-medium hover:opacity-90 transition-opacity flex items-center justify-center"
          >
            {authCta.primary.label}
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
