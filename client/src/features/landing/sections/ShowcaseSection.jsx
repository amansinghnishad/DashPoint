import { Calendar, Github, PanelsTopLeft } from "@/shared/ui/icons";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import SectionHeader from "../components/SectionHeader";

const MotionButton = motion.button;
const MotionDiv = motion.div;

const cards = [
  {
    key: "Resize",
    title: "Resize Panels",
    description: "Easily resize and reorganize panels to fit your workflow.",
    icon: Github,
    gif: "/resize-demo.gif", // 🔥 Change later
  },
  {
    key: "Collections",
    title: "Collections",
    description:
      "Organize and manage your content in customizable collections.",
    icon: PanelsTopLeft,
    gif: "/collections-demo.gif", // 🔥 Change later
  },
  {
    key: "Calendar",
    title: "Calendar",
    description:
      "Keep track of your schedule and upcoming deadlines effortlessly.",
    icon: Calendar,
    gif: "/calendar-demo.gif", // 🔥 Change later
  },
];

export default function ShowcaseSection() {
  const [hoveredKey, setHoveredKey] = useState(null);
  const reduceMotion = useReducedMotion();

  const [isWide, setIsWide] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return true;
    return window.matchMedia("(min-width: 769px)").matches;
  });

  // ✅ Center card open by default
  const defaultKey = "Collections";
  const activeKey = hoveredKey ?? defaultKey;
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
      damping: 30,
      mass: 0.9,
    };
  }, [reduceMotion]);

  return (
    <section id="showcase" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          title="Everything you need, right where you work"
          description="DashPoint brings your content, planning, and key views into a single dashboard."
        />

        <div className="mt-12">
          <div className="flex gap-4" onMouseLeave={() => setHoveredKey(null)}>
            {cards.map((c) => (
              <MotionButton
                key={c.key}
                type="button"
                className="relative h-[420px] overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm focus:outline-none"
                onMouseEnter={() => setHoveredKey(c.key)}
                layout
                style={{ flexBasis: 0 }}
                animate={{
                  flexGrow: !isWide
                    ? 1
                    : activeKey === c.key
                      ? 4
                      : hasActive
                        ? 0.8
                        : 1,
                }}
                transition={motionTransition}
              >
                {/* Icon + Title */}
                <div className="relative z-10 flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                    <c.icon size={18} />
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {c.title}
                  </h3>
                </div>

                {/* Expanding Content */}
                <MotionDiv
                  className="absolute inset-x-6 bottom-6 top-20"
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
                  <p className="text-sm text-slate-600">{c.description}</p>

                  {/* GIF Preview */}
                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                    <img
                      src={c.gif} // 🔥 Change path anytime
                      alt="Feature preview"
                      className="aspect-[16/10] w-full object-cover transition-opacity duration-300"
                    />
                  </div>
                </MotionDiv>
              </MotionButton>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
