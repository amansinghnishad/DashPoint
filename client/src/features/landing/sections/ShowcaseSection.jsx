import { Calendar, Github, PanelsTopLeft } from "@/shared/ui/icons";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import SectionHeader from "../components/SectionHeader";

const MotionDiv = motion.div;

const cards = [
  {
    key: "Resize",
    title: "Resize Panels",
    description: "Easily resize and reorganize panels to fit your workflow.",
    icon: Github,
    image: "/showCase/resize.jpeg",
    video: "/showCase/resize.mp4",
  },
  {
    key: "Collections",
    title: "Collections",
    description:
      "Organize and manage your content in customizable collections.",
    icon: PanelsTopLeft,
    image: "/showCase/collection.jpeg",
    video: "/showCase/collection.mp4",
  },
  {
    key: "Calendar",
    title: "Calendar",
    description:
      "Keep track of your schedule and upcoming deadlines effortlessly.",
    icon: Calendar,
    image: "/showCase/calendar.jpeg",
    video: "/showCase/calendar.mp4",
  },
];

export default function ShowcaseSection() {
  const [hoveredKey, setHoveredKey] = useState(null);
  const reduceMotion = useReducedMotion();
  const [isWide, setIsWide] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 769px)");
    const handleChange = (e) => setIsWide(e.matches);
    setIsWide(mq.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
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
    <section
      id="showcase"
      className="dp-bg dp-showcase-bg py-24 relative overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          title="Everything you need, right where you work"
          description="DashPoint brings your content, planning, and key views into a single dashboard."
        />

        <div className="mt-16">
          <div
            className="flex flex-col gap-8 md:flex-row"
            onMouseLeave={() => setHoveredKey(null)}
          >
            {cards.map((c) => {
              const isActive = hoveredKey === c.key;

              return (
                <MotionDiv
                  key={c.key}
                  layout
                  onMouseEnter={() => isWide && setHoveredKey(c.key)}
                  style={{ flexBasis: 0 }}
                  animate={{
                    flexGrow: !isWide ? 1 : isActive ? 4 : hoveredKey ? 0.9 : 1,
                  }}
                  transition={motionTransition}
                  className="flex h-[520px] flex-col rounded-3xl dp-surface dp-border border shadow-sm transition-shadow duration-300 hover:shadow-xl"
                >
                  {/* Header */}
                  <div className="flex items-center gap-4 px-8 pt-8">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl dp-surface-muted dp-border border dp-text">
                      <c.icon size={20} />
                    </span>
                    <h3 className="text-lg font-semibold dp-text tracking-tight">
                      {c.title}
                    </h3>
                  </div>

                  {/* Description */}
                  {isWide && isActive && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-8 pt-4 text-sm dp-text-muted max-w-sm"
                    >
                      {c.description}
                    </motion.p>
                  )}

                  {/* Media */}
                  <div className="mt-6 flex-1 px-8 pb-8">
                    <div className="relative h-full w-full overflow-hidden rounded-2xl dp-surface-muted dp-border border">
                      <div className="absolute inset-0">
                        {isWide && isActive ? (
                          <video
                            src={c.video}
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="none"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <img
                            src={c.image}
                            alt={c.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </MotionDiv>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
