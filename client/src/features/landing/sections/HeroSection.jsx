import { useEffect, useMemo, useRef, useState } from "react";
import {
  LazyMotion,
  domAnimation,
  m,
  useScroll,
  useTransform,
} from "framer-motion";

const reducedMotionPreferred = () => {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export default function HeroSection() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const canAutoplay = useMemo(() => !reducedMotionPreferred(), []);

  /* ---------------- Framer Scroll ---------------- */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const textY = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const textX = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const textRotate = useTransform(scrollYProgress, [0, 1], [0, -4]);

  const blurValue = useTransform(scrollYProgress, [0, 1], [0, 8]);
  const blurFilter = useTransform(blurValue, (v) => `blur(${v}px)`);

  /* ---------------- Autoplay Video ---------------- */
  useEffect(() => {
    if (!canAutoplay) return;
    const video = videoRef.current;
    if (!video) return;

    const t = setTimeout(() => {
      video.play().catch(() => {});
    }, 100);

    return () => clearTimeout(t);
  }, [canAutoplay]);

  /* ---------------- Mobile Detection ---------------- */
  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    const updateIsMobile = () => setIsMobile(media.matches);
    updateIsMobile();

    media.addEventListener
      ? media.addEventListener("change", updateIsMobile)
      : media.addListener(updateIsMobile);

    return () => {
      media.removeEventListener
        ? media.removeEventListener("change", updateIsMobile)
        : media.removeListener(updateIsMobile);
    };
  }, []);

  /* ---------------- Scroll Background Effects ---------------- */
  useEffect(() => {
    const updateProgress = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;

      if (totalScrollable <= 0) {
        setScrollProgress(0);
        return;
      }

      const progress = Math.min(
        Math.max((-rect.top / totalScrollable) * 1.05, 0),
        1,
      );

      setScrollProgress(progress);
    };

    let rafId = null;

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        updateProgress();
        rafId = null;
      });
    };

    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateProgress);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const bgScale = 1 + scrollProgress * (isMobile ? 0.1 : 0.16);
  const parallaxDriftY = scrollProgress * (isMobile ? 10 : 18);
  const vignetteOpacity = 0.2 + scrollProgress * 0.45;

  return (
    <LazyMotion features={domAnimation}>
      <section
        id="hero"
        ref={sectionRef}
        className="relative overflow-clip bg-slate-950"
        style={{ height: isMobile ? "170vh" : "200vh" }}
      >
        <div className="sticky top-0 h-screen overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-black" />

          {/* Background Image */}
          <div
            className="dp-hero-visual absolute inset-0"
            style={{
              transform: `scale(${bgScale}) translateY(${scrollProgress * -12}px)`,
            }}
          >
            <picture>
              <source media="(max-width: 768px)" srcSet="/bg/mobileBg.webp" />
              <img
                src="/bg/bg.webp"
                alt=""
                className="h-full w-full object-cover"
              />
            </picture>
          </div>

          {/* Foreground */}
          <div
            className="dp-hero-visual pointer-events-none absolute inset-0"
            style={{ transform: `translateY(${parallaxDriftY}px)` }}
          >
            <picture>
              <source
                media="(max-width: 768px)"
                srcSet="/bg/mobileParallex.webp"
              />
              <img
                src="/bg/parallex.webp"
                alt=""
                className="h-full w-full object-cover"
              />
            </picture>
          </div>

          {/* Layout */}
          <div className="absolute inset-0 z-30 flex items-center justify-center px-8 md:px-16">
            <div className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-between gap-12">
              {/* Text */}
              <m.div
                className="flex-1"
                style={{
                  y: textY,
                  x: textX,
                  opacity: textOpacity,
                  rotate: textRotate,
                  filter: blurFilter,
                }}
              >
                <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white">
                  One place for your
                  <span className="block text-blue-400">tasks and content</span>
                </h1>

                <p className="mt-6 text-base md:text-lg text-white/80 leading-relaxed max-w-xl">
                  DashPoint brings your daily tools into a fast, clean
                  workspace. Plan your day, extract content, and stay organized
                  — without juggling tabs.
                </p>

                <div className="mt-8 flex gap-4 flex-wrap">
                  <button className="dp-btn-hero px-7 py-3 rounded-full font-medium">
                    Get started
                  </button>
                  <button className="dp-btn-secondary px-7 py-3 rounded-full font-medium">
                    Pause demo
                  </button>
                </div>
              </m.div>

              {/* Screen */}
              <div className="flex-1 flex justify-center">
                <div className="w-[90%] md:w-[520px] shadow-2xl">
                  <div className="relative aspect-[16/10] overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      className="h-full w-full object-cover"
                      muted
                      loop
                      playsInline
                      autoPlay
                      preload="metadata"
                    >
                      <source src="/1.mp4" type="video/mp4" />
                    </video>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vignette */}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50"
            style={{ opacity: vignetteOpacity }}
          />
        </div>
      </section>
    </LazyMotion>
  );
}
