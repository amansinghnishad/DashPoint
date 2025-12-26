import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Shield, Sparkles, Zap } from "lucide-react";

const reducedMotionPreferred = () => {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export default function HeroSection() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const canAutoplay = useMemo(() => !reducedMotionPreferred(), []);

  useEffect(() => {
    if (!canAutoplay) return;
    const video = videoRef.current;
    if (!video) return;

    const t = window.setTimeout(() => {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }, 100);

    return () => window.clearTimeout(t);
  }, [canAutoplay]);

  const onTogglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (video.paused) {
        await video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    } catch {
      setIsPlaying(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-slate-950">
      <div
        className="dp-glow pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div className="absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-indigo-600/40 blur-3xl" />
        <div className="absolute -bottom-24 right-[-10rem] h-72 w-[36rem] rounded-full bg-amber-400/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pb-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl text-white">
              One place for your
              <span className="block text-white/90">tasks and content</span>
            </h1>
            <p className="mt-5 text-base leading-7 sm:text-lg text-white/70">
              DashPoint brings your daily tools into a fast, clean workspace.
              Plan your day, extract content, and stay organized—without
              juggling tabs.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/register"
                className="dp-btn-primary inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold shadow-sm"
              >
                Get started
                <ArrowRight size={16} className="ml-2" />
              </Link>

              <button
                type="button"
                onClick={onTogglePlay}
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                <Play size={16} className="mr-2" />
                {isPlaying ? "Pause demo" : "Watch demo"}
              </button>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Zap size={16} className="text-amber-300" />
                  Fast
                </div>
                <p className="mt-2 text-sm text-white/70">
                  Optimized for quick daily use.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Shield size={16} className="text-amber-300" />
                  Secure
                </div>
                <p className="mt-2 text-sm text-white/70">
                  Token-based auth and API access.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Sparkles size={16} className="text-amber-300" />
                  Flexible
                </div>
                <p className="mt-2 text-sm text-white/70">
                  Build your dashboard your way.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl">
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
                <video
                  ref={videoRef}
                  className="h-full w-full object-cover"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                >
                  <source src="/2.mp4" type="video/mp4" />
                </video>
                {!isPlaying ? (
                  <button
                    type="button"
                    onClick={onTogglePlay}
                    className="absolute inset-0 grid place-items-center"
                    aria-label="Play demo"
                  >
                    <span
                      className={`inline-flex items-center justify-center rounded-full p-4 backdrop-blur ${"bg-white/15 hover:bg-white/20"}`}
                    >
                      <Play size={28} className="text-white" />
                    </span>
                  </button>
                ) : null}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">Widgets</p>
                  <p className="mt-1 text-sm text-white/70">
                    Calendar, planner, YouTube.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">
                    Content extraction
                  </p>
                  <p className="mt-1 text-sm text-white/70">
                    Save structured summaries fast.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
