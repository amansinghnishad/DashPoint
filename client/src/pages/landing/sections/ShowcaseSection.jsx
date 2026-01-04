import {
  CheckCircle2,
  Calendar,
  Github,
  MessageSquare,
  PanelsTopLeft,
  Workflow,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import SectionHeader from "../components/SectionHeader";

const cards = [
  {
    key: "github",
    title: "GitHub",
    description: "Placeholder panel — swap in your screenshot/image later.",
    icon: Github,
  },
  {
    key: "workflows",
    title: "Workflows",
    description: "Placeholder panel — swap in your screenshot/image later.",
    icon: Workflow,
  },
  {
    key: "dashboard",
    title: "Dashboards",
    description: "Placeholder panel — swap in your screenshot/image later.",
    icon: PanelsTopLeft,
  },
  {
    key: "calendar",
    title: "Calendar",
    description: "Placeholder panel — swap in your screenshot/image later.",
    icon: Calendar,
  },
];

export default function ShowcaseSection() {
  const [hoveredKey, setHoveredKey] = useState(null);
  const reduceMotion = useReducedMotion();
  const [isWide, setIsWide] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return true;
    return window.matchMedia("(min-width: 769px)").matches;
  });

  const activeKey = useMemo(() => hoveredKey ?? "dashboard", [hoveredKey]);
  const hasActive = Boolean(activeKey);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(min-width: 769px)");
    const onChange = (e) => setIsWide(e.matches);
    setIsWide(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const motionTransition = useMemo(() => {
    if (reduceMotion) return { duration: 0 };
    return {
      type: "spring",
      stiffness: 260,
      damping: 32,
      mass: 0.8,
    };
  }, [reduceMotion]);

  return (
    <section id="showcase" className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Everything you need, right where you work"
          description="DashPoint brings your content, planning, and key views into a single dashboard — fast to open, easy to scan, and built for momentum."
        />
        <div className="mt-12">
          <div
            className="dp-expanding-cards"
            aria-label="Interactive showcase cards"
            onMouseLeave={() => setHoveredKey(null)}
          >
            {cards.map((c) => (
              <motion.button
                key={c.key}
                type="button"
                className="dp-expanding-card group relative h-72 overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 lg:h-[500px]"
                aria-label={`${c.title} showcase card`}
                onMouseEnter={() => setHoveredKey(c.key)}
                onFocus={() => setHoveredKey(c.key)}
                onBlur={() => setHoveredKey(null)}
                layout
                style={{ flexBasis: 0 }}
                animate={{
                  flexGrow: !isWide
                    ? 1
                    : activeKey === c.key
                    ? 4
                    : hasActive
                    ? 0.65
                    : 1,
                }}
                transition={motionTransition}
              >
                <div className="relative z-10 flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                    <c.icon size={18} />
                  </span>
                </div>

                <motion.div
                  className="dp-expanding-card-details absolute inset-x-5 bottom-5 top-16"
                  initial={false}
                  animate={{
                    opacity: !isWide || activeKey === c.key ? 1 : 0,
                    y: !isWide || activeKey === c.key ? 0 : 8,
                  }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.25, ease: "easeOut" }
                  }
                  style={{
                    pointerEvents:
                      !isWide || activeKey === c.key ? "auto" : "none",
                  }}
                >
                  <p className="text-sm leading-6 text-slate-600">
                    {c.description}
                  </p>

                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                    <div className="grid aspect-[16/10] place-items-center">
                      <span className="text-xs font-medium text-slate-500">
                        Image placeholder
                      </span>
                    </div>
                  </div>
                </motion.div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
