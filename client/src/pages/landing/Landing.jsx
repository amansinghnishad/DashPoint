import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { VideoShowcase } from "./components/VideoShowcase";
import { Pricing } from "./components/Pricing";
import { Footer } from "./components/Footer";
import { Navigation } from "./components/Navigation";
import "./landing.css";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export const Landing = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Page entrance animation
      gsap.fromTo(
        ".landing-container",
        { opacity: 0 },
        { opacity: 1, duration: 1, ease: "power2.out" }
      );

      // Smooth scroll behavior
      gsap.to(window, {
        scrollBehavior: "smooth",
      });

      // Parallax background effect
      gsap.to(".parallax-bg", {
        yPercent: -50,
        ease: "none",
        scrollTrigger: {
          trigger: ".parallax-bg",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="landing-container">
      <Navigation />
      <Hero />
      <Features />
      <VideoShowcase />
      <Pricing />
      <Footer />
    </div>
  );
};
