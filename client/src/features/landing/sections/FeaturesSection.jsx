"use client";

import { Calendar, FileText, Youtube, Zap } from "@/shared/ui/icons";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    icon: Calendar,
    title: "Smart Calendar",
    description:
      "Track events, deadlines, and daily plans in one organized view.",
    story: "Your day should feel clear focused and under control.",
    backgroundWord: "CLARITY",
  },
  {
    icon: Youtube,
    title: "YouTube Integration",
    description: "Embed and manage videos directly inside your workspace.",
    story: "Learning should live inside your workflow.",
    backgroundWord: "LEARN",
  },
  {
    icon: FileText,
    title: "File Management",
    description: "Upload organize and access important files anytime.",
    story: "Everything important in one structured place.",
    backgroundWord: "STRUCTURE",
  },
  {
    icon: Zap,
    title: "AI Chat Assistant",
    description: "Ask plan and generate ideas instantly with built-in AI chat.",
    story: "Ideas move faster when intelligence supports you.",
    backgroundWord: "INTELLIGENCE",
  },
];

export default function FeaturesSection() {
  return (
    <section className="relative dp-bg dp-text overflow-hidden">
      {features.map((feature) => {
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
          <div
            key={feature.title}
            ref={ref}
            className="relative h-[120vh] flex items-center justify-center"
          >
            <motion.div
              style={{ opacity }}
              className="sticky top-0 h-screen flex flex-col items-center justify-center text-center px-6"
            >
              {/* Background Word */}
              <div className="absolute top-1/2 -translate-y-1/2 pointer-events-none select-none">
                <h2
                  className="text-[80px] sm:text-[100px] md:text-[130px] lg:text-[150px]
font-extrabold tracking-widest dp-text-subtle opacity-10"
                >
                  {feature.backgroundWord}
                </h2>
              </div>

              {/* Story Text */}
              <div className="mb-16 flex flex-wrap justify-center gap-4 max-w-4xl z-10">
                {words.map((word, i) => {
                  const delay = i * 0.01;
                  const wordStart = 0.08 + delay;
                  const wordEnd = 0.26 + delay;

                  const wordOpacity = useTransform(
                    smooth,
                    [wordStart, wordEnd],
                    [0, 1],
                  );

                  const y = useTransform(smooth, [wordStart, wordEnd], [24, 0]);

                  return (
                    <motion.span
                      key={i}
                      style={{ opacity: wordOpacity, y }}
                      className="text-4xl md:text-6xl font-semibold tracking-tight
                      bg-gradient-to-r dp-text-soft
                      bg-clip-text text-transparent"
                    >
                      {word}
                    </motion.span>
                  );
                })}
              </div>

              {/* Monitor */}
              <div className="relative mt-28 md:mt-32 [perspective:2000px]">
                <motion.div
                  style={{ scale, rotateX, rotateY }}
                  className="relative [transform-style:preserve-3d]"
                >
                  {/* Subtle Glow */}
                  <div
                    className="absolute -inset-24 rounded-[3rem] blur-[120px] dp-glow"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%)",
                    }}
                  />

                  {/* Monitor Body */}
                  <div
                    className="relative rounded-[2.5rem] dp-surface dp-border border
                    backdrop-blur-xl p-4 shadow-[0_40px_120px_rgba(0,0,0,0.6)]"
                    style={{ transform: "translateZ(40px)" }}
                  >
                    <div
                      className="rounded-[2rem] bg-black/90 dp-border border
                      p-8 md:p-12 relative overflow-hidden"
                    >
                      {/* Glass reflection */}
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{
                          background:
                            "linear-gradient(120deg, rgba(255,255,255,0.25), transparent 40%)",
                        }}
                      />

                      <div className="relative z-10 text-center">
                        <div className="mb-8 flex justify-center dp-text-soft">
                          <feature.icon size={72} />
                        </div>

                        <h3 className="text-3xl font-semibold mb-4 tracking-tight dp-text">
                          {feature.title}
                        </h3>

                        <p className="dp-text-muted text-lg max-w-md mx-auto leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>

                    <div
                      className="absolute left-1/2 bottom-3 h-1.5 w-20
                      -translate-x-1/2 rounded-full bg-white/20"
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        );
      })}
    </section>
  );
}
