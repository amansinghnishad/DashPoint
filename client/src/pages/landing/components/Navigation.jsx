import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Zap } from "lucide-react";
import { InstallButton } from "../../../components/install-button";

export const Navigation = () => {
  const navRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Check if we're on a light background page (auth pages)
  const isLightPage =
    location.pathname === "/login" || location.pathname === "/register";

  // Determine navigation style based on page and scroll state
  const getNavStyle = () => {
    if (isLightPage) {
      return isScrolled
        ? "bg-white/95 backdrop-blur-sm shadow-md py-2"
        : "bg-white/90 backdrop-blur-sm py-4";
    }
    return isScrolled ? "glass-nav py-2" : "py-4";
  };

  const getTextColor = () => {
    return isLightPage ? "text-gray-900" : "text-white";
  };

  const getHoverColor = () => {
    return isLightPage ? "hover:text-purple-600" : "hover:text-yellow-300";
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Navigation entrance animation
      gsap.fromTo(
        ".nav-item",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, delay: 0.2 }
      );

      // Logo animation
      gsap.fromTo(
        ".logo",
        { scale: 0, rotation: -180 },
        {
          scale: 1,
          rotation: 0,
          duration: 0.8,
          ease: "back.out(1.7)",
          delay: 0.1,
        }
      );
    }, navRef);

    // Scroll listener for navbar background
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      ctx.revert();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };
  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${getNavStyle()}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center logo">
            <div className="bg-white p-2 rounded-xl mr-3 animate-pulse-glow">
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
            <span className={`text-2xl font-bold ${getTextColor()}`}>
              Dash
              <span
                className={isLightPage ? "text-purple-600" : "text-yellow-300"}
              >
                Point
              </span>
            </span>
          </div>{" "}
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("features")}
              className={`nav-item ${getTextColor()} ${getHoverColor()} transition-colors duration-300`}
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("showcase")}
              className={`nav-item ${getTextColor()} ${getHoverColor()} transition-colors duration-300`}
            >
              Demo
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className={`nav-item ${getTextColor()} ${getHoverColor()} transition-colors duration-300`}
            >
              Pricing
            </button>            <Link
              to="/login"
              className={`nav-item ${getTextColor()} ${getHoverColor()} transition-colors duration-300`}
            >
              Sign In
            </Link>
            <InstallButton className="nav-item" />
            <Link
              to="/register"
              className={`nav-item ${
                isLightPage
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-white text-purple-600 hover:bg-yellow-300 hover:text-purple-700"
              } px-6 py-2 rounded-full transition-all duration-300 hover-lift font-semibold`}
            >
              Start Free
            </Link>
          </div>{" "}
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className={`${getTextColor()} ${getHoverColor()} transition-colors duration-300`}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>{" "}
        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            isMenuOpen ? "max-h-screen opacity-100 mt-4" : "max-h-0 opacity-0"
          }`}
        >
          <div
            className={`${
              isLightPage
                ? "bg-white/95 backdrop-blur-sm shadow-lg"
                : "glass-card"
            } p-4 space-y-4 rounded-xl`}
          >
            <button
              onClick={() => scrollToSection("features")}
              className={`block w-full text-left ${getTextColor()} ${getHoverColor()} transition-colors duration-300`}
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("showcase")}
              className={`block w-full text-left ${getTextColor()} ${getHoverColor()} transition-colors duration-300`}
            >
              Demo
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className={`block w-full text-left ${getTextColor()} ${getHoverColor()} transition-colors duration-300`}
            >
              Pricing
            </button>            <Link
              to="/login"
              className={`block ${getTextColor()} ${getHoverColor()} transition-colors duration-300`}
            >
              Sign In
            </Link>
            <div className="flex justify-center">
              <InstallButton />
            </div>
            <Link
              to="/register"
              className={`block ${
                isLightPage
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-white text-purple-600 hover:bg-yellow-300 hover:text-purple-700"
              } px-6 py-2 rounded-full transition-all duration-300 text-center font-semibold`}
            >
              Start Free
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
