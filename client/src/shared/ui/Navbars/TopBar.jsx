import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useLocation } from "react-router-dom";
import { APP_ROUTES } from "../../../app/routes/paths";
import useTheme from "../../../hooks/useTheme";
import TopBarDesktop from "./TopBarDesktop";
import TopBarMobile from "./TopBarMobile";

const isReducedMotionPreferred = () => {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

const TopBar = () => {
  const navRef = useRef(null);
  const menuId = useId();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const logoSrc = "/logo.png";

  const isAuthPage = useMemo(() => {
    return (
      location.pathname === APP_ROUTES.LOGIN ||
      location.pathname === APP_ROUTES.REGISTER
    );
  }, [location.pathname]);

  const isLandingPage = useMemo(() => {
    return location.pathname === APP_ROUTES.HOME;
  }, [location.pathname]);

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 50);

    if (!isLandingPage) {
      setIsPastHero(false);
      return;
    }

    const hero = document.getElementById("hero");
    if (!hero) {
      setIsPastHero(false);
      return;
    }

    const navHeight = navRef.current?.getBoundingClientRect().height ?? 0;
    const heroRect = hero.getBoundingClientRect();
    setIsPastHero(heroRect.bottom <= navHeight + 8);
  }, [isLandingPage]);

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

  useEffect(() => {
    if (!isMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
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
    if (isMenuOpen) {
      return "fixed z-50";
    }

    const base =
      "fixed top-0 left-1/2 -translate-x-1/2 w-[90%] max-w-7xl z-50 transition-all duration-300";

    const scrolled = isScrolled ? "shadow-md py-2" : "py-4";
    const bg = isScrolled
      ? "dp-nav-panel-bg backdrop-blur-sm rounded-3xl top-5"
      : "bg-transparent";

    return `${base} ${bg} ${scrolled}`;
  }, [isMenuOpen, isScrolled]);

  const useDarkText =
    theme === "dark" && isLandingPage && isPastHero && !isMenuOpen;
  const textClass = useDarkText ? "text-black" : "text-white";
  const hoverClass = "hover:text-amber-300";
  const navItemClass = `${textClass} ${hoverClass} transition-colors duration-300`;
  const activeNavLinkClass = "text-amber-300";

  const themeButtonClass = useDarkText
    ? "inline-flex items-center justify-center rounded-full border border-black/15 bg-black/5 p-2 text-black hover:bg-black/10 transition-colors duration-300"
    : "inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 p-2 text-white hover:bg-white/10 transition-colors duration-300";

  const authCta = useMemo(() => {
    if (!isAuthPage) {
      return {
        secondary: { to: APP_ROUTES.LOGIN, label: "Sign In" },
        primary: { to: APP_ROUTES.REGISTER, label: "Start Free" },
      };
    }

    if (location.pathname === APP_ROUTES.LOGIN) {
      return {
        secondary: null,
        primary: { to: APP_ROUTES.REGISTER, label: "Sign Up" },
      };
    }

    // /register
    return {
      secondary: { to: APP_ROUTES.LOGIN, label: "Sign In" },
      primary: null,
    };
  }, [isAuthPage, location.pathname]);

  return (
    <nav ref={navRef} className={navClassName} aria-label="Primary">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link
            to={APP_ROUTES.HOME}
            className={
              isMenuOpen ? "hidden md:flex items-center" : "flex items-center"
            }
            aria-label="DashPoint"
          >
            <img src={logoSrc} alt="DashPoint Logo" className="h-12 sm:h-14" />
          </Link>

          <TopBarDesktop
            navItemClass={navItemClass}
            activeNavLinkClass={activeNavLinkClass}
            scrollToSection={scrollToSection}
            authCta={authCta}
            theme={theme}
            onToggleTheme={onToggleTheme}
            themeButtonClass={themeButtonClass}
          />

          <TopBarMobile
            themeButtonClass={themeButtonClass}
            theme={theme}
            onToggleTheme={onToggleTheme}
            toggleMenu={toggleMenu}
            isMenuOpen={isMenuOpen}
            menuId={menuId}
            setIsMenuOpen={setIsMenuOpen}
            scrollToSection={scrollToSection}
            logoSrc={logoSrc}
            authCta={authCta}
          />
        </div>
      </div>
    </nav>
  );
};

export default TopBar;
