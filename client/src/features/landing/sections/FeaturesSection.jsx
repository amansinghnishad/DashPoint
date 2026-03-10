import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    title: "YouTube Integration",
    videoSrc: "/feature/youtube.mp4",
    story: "Learning should live inside your workflow.",
    backgroundWord: "LEARN",
  },
  {
    title: "File Management",
    videoSrc: "/feature/fileManagement.mp4",
    story: "Everything important in one structured place.",
    backgroundWord: "STRUCTURE",
  },
  {
    title: "AI Chat Assistant",
    videoSrc: "/feature/aiChatAssistant.mp4",
    story: "Ideas move faster when intelligence supports you.",
    backgroundWord: "INTELLIGENCE",
  },
  {
    title: "Smart Calendar",
    videoSrc: "/feature/smartCalendar.mp4",
    story: "Your day should feel clear focused and under control.",
    backgroundWord: "CLARITY",
  },
];

const WORD_REVEAL_STAGGER = 0.04;
const MotionDiv = motion.div;
const MotionSpan = motion.span;

const STORY_WORD_VARIANTS = {
  hidden: { opacity: 0, y: 24 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.24,
      ease: "easeOut",
      delay: index * WORD_REVEAL_STAGGER,
    },
  }),
};

function FeaturePanel({ feature }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  });

  const opacity = useTransform(smooth, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(smooth, [0, 1], [0.96, 1]);
  const rotateX = useTransform(smooth, [0, 1], [8, 2]);
  const rotateY = useTransform(smooth, [0, 1], [-4, 0]);
  const words = feature.story.split(" ");

  return (
    <div ref={ref} className="relative h-[120vh] flex items-center justify-center">
      <MotionDiv
        style={{ opacity }}
        className="sticky top-0 h-screen flex flex-col items-center justify-center text-center px-6"
      >
        <div className="absolute top-[30%] -translate-y-1/2 pointer-events-none select-none">
          <h2
            className="text-[80px] sm:text-[100px] md:text-[130px] lg:text-[150px]
font-extrabold tracking-widest dp-text-subtle opacity-10"
          >
            {feature.backgroundWord}
          </h2>
        </div>

        <MotionDiv
          className="mb-16 flex flex-wrap justify-center gap-4 max-w-4xl z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.5 }}
        >
          {words.map((word, index) => (
            <MotionSpan
              key={`${feature.title}-${word}-${index}`}
              custom={index}
              variants={STORY_WORD_VARIANTS}
              className="text-4xl md:text-6xl font-semibold tracking-tight
                bg-gradient-to-r dp-text-soft
                bg-clip-text text-transparent"
            >
              {word}
            </MotionSpan>
          ))}
        </MotionDiv>

        <div className="relative mt-28 md:mt-32 w-[92vw] max-w-[980px] [perspective:500px]">
          <MotionDiv
            style={{ scale, rotateX, rotateY }}
            className="relative [transform-style:preserve-3d]"
          >
            <div
              className="absolute -inset-24 rounded-[3rem] blur-[120px] dp-glow"
              style={{
                background: "radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%)",
              }}
            />

            <div
              className="relative rounded-[2.5rem] dp-surface dp-border border
              backdrop-blur-xl p-4 shadow-[0_40px_120px_rgba(0,0,0,0.6)]"
              style={{ transform: "translateZ(40px)" }}
            >
              <div
                className="rounded-[2rem] bg-black/90 dp-border border
                p-10 md:p-14 min-h-[360px] md:min-h-[460px] relative overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: "linear-gradient(120deg, rgba(255,255,255,0.25), transparent 40%)",
                  }}
                />

                <div className="relative z-10 h-full w-full">
                  <video
                    key={feature.videoSrc}
                    src={feature.videoSrc}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    className="h-full w-full rounded-2xl object-cover"
                  />
                </div>
              </div>

              <div
                className="absolute left-1/2 bottom-3 h-1.5 w-20
                -translate-x-1/2 rounded-full bg-white/20"
              />
            </div>
          </MotionDiv>
        </div>
      </MotionDiv>
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <section className="relative dp-bg dp-text overflow-hidden">
      {features.map((feature) => (
        <FeaturePanel key={feature.title} feature={feature} />
      ))}
    </section>
  );
}
