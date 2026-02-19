import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import SectionHeader from "../components/SectionHeader";
import { Calendar, Github, PanelsTopLeft } from "@/shared/ui/icons";

const MotionDiv = m.div;

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

function VideoPreview({ src, isActive }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isActive]);

  return (
    <m.video
      ref={videoRef}
      src={src}
      loop
      muted
      playsInline
      preload="metadata"
      className="absolute inset-0 h-full w-full object-cover"
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    />
  );
}

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
      stiffness: 280,
      damping: 34,
      mass: 0.65,
    };
  }, [reduceMotion]);

  return (
    <LazyMotion features={domAnimation}>
      <section
        id="showcase"
        className="dp-bg dp-showcase-bg relative overflow-hidden py-20 md:py-24"
      >
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            title="Everything you need, right where you work"
            description="DashPoint brings your content, planning, and key views into a single dashboard."
          />

          <div className="mt-14">
            <div
              className="flex flex-col gap-6 md:flex-row"
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
                      flexGrow: !isWide
                        ? 1
                        : isActive
                          ? 3.2
                          : hoveredKey
                            ? 0.9
                            : 1,
                    }}
                    transition={motionTransition}
                    className="flex flex-col rounded-3xl border dp-border dp-surface shadow-sm transition-shadow duration-200 hover:shadow-xl"
                  >
                    {/* HEADER */}
                    <div className="px-6 pt-6">
                      <div className="flex items-center gap-4">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border dp-border dp-surface-muted dp-text">
                          <c.icon size={20} />
                        </span>
                        <h3 className="text-lg font-semibold tracking-tight dp-text">
                          {c.title}
                        </h3>
                      </div>

                      {(!isWide || isActive) && (
                        <m.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="mt-4 max-w-sm text-sm dp-text-muted"
                        >
                          {c.description}
                        </m.p>
                      )}
                    </div>

                    {/* MEDIA */}
                    <div className="mt-6 px-6 pb-6 flex-1">
                      <div className="relative h-[260px] md:h-[340px] w-full overflow-hidden rounded-2xl border dp-border dp-surface-muted">
                        {/* IMAGE LAYER */}
                        <m.img
                          src={c.image}
                          alt={c.title}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover"
                          animate={{
                            opacity: isWide && isActive ? 0 : 1,
                            scale: isWide && isActive ? 1.02 : 1,
                          }}
                          transition={{
                            duration: 0.2,
                            ease: "easeOut",
                          }}
                        />

                        {/* VIDEO LAYER */}
                        {isWide && (
                          <VideoPreview src={c.video} isActive={isActive} />
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
    </LazyMotion>
  );
}
