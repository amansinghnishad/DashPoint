import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { APP_ROUTES } from "../../../app/routes/paths";

export default function TopBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isLoginPage = location.pathname === APP_ROUTES.LOGIN;
  const isRegisterPage = location.pathname === APP_ROUTES.REGISTER;

  const NAV_LINKS = [
    { id: "capabilities", label: "Capabilities", href: "/#capabilities" },
    { id: "manifesto", label: "Manifesto", href: "/#manifesto" },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 flex justify-between items-center transition-all duration-500 px-xl md:px-xxl ${
        isScrolled
          ? "bg-canvas/85 backdrop-blur-xl h-16 border-b border-hairline/80 shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
          : "h-20"
      }`}
    >
      <div className="flex items-center gap-xl">
        <Link
          to={APP_ROUTES.HOME}
          className="relative font-waldenburg-light text-2xl tracking-tight text-ink group py-1.5 px-2 -ml-2 rounded-xl transition-transform duration-200 active:scale-95"
        >
          <span>DASHPOINT</span>
          <span className="absolute bottom-1 left-2 right-2 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </Link>

        {/* Liquid Bubble Nav Items */}
        <div
          className="hidden md:flex items-center gap-1 p-1 rounded-full bg-ink/[0.03] dark:bg-white/[0.04] border border-hairline/60"
          onMouseLeave={() => setHoveredNav(null)}
        >
          {NAV_LINKS.map((link) => {
            const isHovered = hoveredNav === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                onMouseEnter={() => setHoveredNav(link.id)}
                className={`relative px-5 py-2 text-[14px] font-medium tracking-tight rounded-full transition-colors duration-200 z-10 select-none ${
                  isHovered ? "text-ink font-semibold" : "text-muted hover:text-ink"
                }`}
              >
                {isHovered && (
                  <motion.span
                    layoutId="navbar-liquid-bubble"
                    className="absolute inset-0 rounded-full bg-surface-card border border-amber-500/30 shadow-[0_2px_16px_rgba(249,145,73,0.16)] -z-10"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 28,
                      mass: 0.7,
                    }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </a>
            );
          })}
        </div>
      </div>

      <div
        className="flex items-center gap-3"
        onMouseLeave={() => {
          if (hoveredNav === "login" || hoveredNav === "register") setHoveredNav(null);
        }}
      >
        {isLoginPage ? (
          <Link
            to={APP_ROUTES.REGISTER}
            className="relative group bg-ink text-canvas px-8 py-2.5 rounded-full text-[14px] font-medium hover:shadow-[0_0_24px_rgba(249,145,73,0.25)] transition-all duration-300 active:scale-98 flex items-center justify-center overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10">Register</span>
          </Link>
        ) : isRegisterPage ? (
          <Link
            to={APP_ROUTES.LOGIN}
            className="relative group bg-ink text-canvas px-8 py-2.5 rounded-full text-[14px] font-medium hover:shadow-[0_0_24px_rgba(249,145,73,0.25)] transition-all duration-300 active:scale-98 flex items-center justify-center overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10">Sign In</span>
          </Link>
        ) : (
          <>
            <Link
              to={APP_ROUTES.LOGIN}
              onMouseEnter={() => setHoveredNav("login")}
              className={`relative hidden md:inline-flex px-5 py-2 text-[14px] font-medium tracking-tight rounded-full transition-colors duration-200 z-10 select-none ${
                hoveredNav === "login" ? "text-ink font-semibold" : "text-muted hover:text-ink"
              }`}
            >
              {hoveredNav === "login" && (
                <motion.span
                  layoutId="navbar-action-bubble"
                  className="absolute inset-0 rounded-full bg-surface-card border border-amber-500/30 shadow-[0_2px_16px_rgba(249,145,73,0.16)] -z-10"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 28,
                    mass: 0.7,
                  }}
                />
              )}
              <span className="relative z-10">Sign In</span>
            </Link>

            <Link
              to={APP_ROUTES.REGISTER}
              onMouseEnter={() => setHoveredNav("register")}
              className="relative group bg-ink text-canvas px-7 py-2.5 rounded-full text-[14px] font-medium hover:shadow-[0_0_24px_rgba(249,145,73,0.3)] transition-all duration-300 active:scale-98 flex items-center justify-center overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-amber-500/30 via-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center gap-1.5">
                Try free
                <span className="text-amber-400 group-hover:translate-x-0.5 transition-transform duration-200">
                  →
                </span>
              </span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
