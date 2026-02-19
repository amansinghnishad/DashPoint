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

    if (mq.addEventListener) {
      mq.addEventListener("change", handleChange);
      return () => mq.removeEventListener("change", handleChange);
    }

    mq.addListener(handleChange);
    return () => mq.removeListener(handleChange);
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
      className="lg:h-[85vh] md:h-auto dp-bg dp-showcase-bg relative overflow-hidden py-12 sm:py-14 md:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-6">
        <SectionHeader
          title="Everything you need, right where you work"
          description="DashPoint brings your content, planning, and key views into a single dashboard."
        />

        <div className="mt-8 sm:mt-10 md:mt-12">
          <div
            className="flex flex-col gap-4 sm:gap-5 md:flex-row md:gap-6"
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
                  className="flex min-h-[400px] flex-col rounded-3xl border dp-border dp-surface shadow-sm transition-shadow duration-300 hover:shadow-xl sm:min-h-[430px] md:min-h-[470px]"
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 px-4 pt-4 sm:gap-4 sm:px-5 sm:pt-5 md:px-6 md:pt-6">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl border dp-border dp-surface-muted dp-text sm:h-12 sm:w-12">
                      <c.icon size={20} />
                    </span>
                    <h3 className="text-base font-semibold tracking-tight dp-text sm:text-lg">
                      {c.title}
                    </h3>
                  </div>

                  {/* Description */}
                  {(!isWide || isActive) && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="max-w-full px-4 pt-2 text-sm dp-text-muted sm:max-w-sm sm:px-5 sm:pt-3 md:px-6"
                    >
                      {c.description}
                    </motion.p>
                  )}

                  {/* Media */}
                  <div className="mt-3 px-4 pb-4 sm:mt-4 sm:px-5 sm:pb-5 md:px-6 md:pb-6">
                    <div className="relative h-52 w-full overflow-hidden rounded-2xl border dp-border dp-surface-muted sm:h-56 md:h-72 lg:h-85">
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
                          className="h-full w-full object-cover transition-transform duration-700 md:hover:scale-105"
                        />
                      )}
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
