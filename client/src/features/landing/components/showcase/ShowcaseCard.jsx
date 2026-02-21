import { m } from "framer-motion";
import VideoPreview from "./VideoPreview";

const MotionDiv = m.div;

const PANEL_CLASS_NAME =
  "relative h-[320px] md:h-[480px] w-full overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl";

const LIGHT_POSITIONS = [
  "circle at 15% 8%",
  "circle at 50% 8%",
  "circle at 85% 8%",
];

function getCardAnimation(isWide, isActive) {
  if (!isWide) {
    return { flexGrow: 1, scale: 1, opacity: 1 };
  }

  return {
    flexGrow: isActive ? 3.5 : 1,
    scale: isActive ? 1 : 0.96,
    opacity: isActive ? 1 : 0.75,
  };
}

function getImageAnimation(isWide, isActive) {
  return {
    opacity: isWide && isActive ? 0 : 1,
    scale: isWide && isActive ? 1.05 : 1,
    filter: isActive ? "brightness(1.1) contrast(1.05)" : "brightness(0.6)",
  };
}

function getLightPosition(index) {
  return LIGHT_POSITIONS[index] ?? LIGHT_POSITIONS[1];
}

export default function ShowcaseCard({
  card,
  index,
  isWide,
  isActive,
  onHover,
  motionTransition,
}) {
  return (
    <MotionDiv
      layout
      style={{ flexBasis: 0 }}
      onMouseEnter={() => onHover(card.key)}
      animate={getCardAnimation(isWide, isActive)}
      transition={motionTransition}
      className="flex flex-col"
    >
      <div className={PANEL_CLASS_NAME}>
        <m.img
          src={card.image}
          alt={card.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          animate={getImageAnimation(isWide, isActive)}
          transition={{ duration: 0.6 }}
        />

        {isWide && <VideoPreview src={card.video} isActive={isActive} />}

        <m.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: isActive ? 0.9 : 0.5 }}
          transition={{ duration: 1.2 }}
          style={{
            background: `radial-gradient(${getLightPosition(index)}, rgba(255, 220, 120, 0.45), transparent 65%)`,
            mixBlendMode: "screen",
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at center, transparent 55%, rgba(0,0,0,0.7) 100%)",
          }}
        />
      </div>

      <div className="mt-6 flex justify-center">
        <h3 className="text-base font-semibold text-white tracking-wide">
          {card.title}
        </h3>
      </div>
    </MotionDiv>
  );
}
