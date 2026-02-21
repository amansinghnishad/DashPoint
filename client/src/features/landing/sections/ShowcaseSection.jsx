import { LazyMotion, domAnimation, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import SectionHeader from "../components/SectionHeader";
import ShowcaseCard from "../components/showcase/ShowcaseCard";
import {
  cards,
  DEFAULT_ACTIVE_CARD_KEY,
  SHOWCASE_BREAKPOINT_QUERY,
} from "../components/showcase/showcaseConstants";

export default function ShowcaseSection() {
  const [activeKey, setActiveKey] = useState(DEFAULT_ACTIVE_CARD_KEY);
  const reduceMotion = useReducedMotion();
  const [isWide, setIsWide] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia(SHOWCASE_BREAKPOINT_QUERY);
    const handleChange = (e) => setIsWide(e.matches);

    setIsWide(mq.matches);
    mq.addEventListener("change", handleChange);

    return () => mq.removeEventListener("change", handleChange);
  }, []);

  const motionTransition = useMemo(() => {
    if (reduceMotion) return { duration: 0 };
    return {
      type: "spring",
      stiffness: 200,
      damping: 25,
      mass: 0.8,
    };
  }, [reduceMotion]);

  return (
    <LazyMotion features={domAnimation}>
      <section
        id="showcase"
        className="relative overflow-hidden py-24 bg-black"
      >
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            title="Everything you need, right where you work"
            description="DashPoint brings your content, planning, and key views into a single dashboard."
          />

          <div className="mt-16">
            <div
              className="flex flex-col gap-6 md:flex-row"
              onMouseLeave={() =>
                isWide && setActiveKey(DEFAULT_ACTIVE_CARD_KEY)
              }
            >
              {cards.map((card, index) => (
                <ShowcaseCard
                  key={card.key}
                  card={card}
                  index={index}
                  isWide={isWide}
                  isActive={activeKey === card.key}
                  onHover={(nextKey) => isWide && setActiveKey(nextKey)}
                  motionTransition={motionTransition}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}
