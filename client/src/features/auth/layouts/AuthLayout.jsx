import { LazyMotion, domAnimation, motion, useReducedMotion } from "framer-motion";

import Footer from "../../../shared/ui/Footer/Footer";
import TopBar from "../../../shared/ui/Navbars/TopBar";
import KineticGrid from "../../landing/components/KineticGrid";

const EMPTY_ASIDE_ITEMS = [];
const EMPTY_ASIDE_FOOTER_ITEMS = [];
const MotionDiv = motion.div;

const GlowBackdrop = () => {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Top Primary Warm Peach Glow Orb */}
      <div
        className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[1100px] h-[900px] rounded-full"
        style={{
          background: "linear-gradient(to bottom, rgba(254, 215, 170, 0.9), rgba(253, 186, 116, 0.4), transparent)",
          filter: "blur(90px)",
          WebkitFilter: "blur(90px)",
        }}
      />
      {/* Secondary Soft Amber Glow Center */}
      <div
        className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[850px] h-[850px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(249, 145, 73, 0.25) 0%, rgba(253, 186, 116, 0.1) 50%, transparent 80%)",
          filter: "blur(120px)",
          WebkitFilter: "blur(120px)",
        }}
      />
      {/* Vignette Mask for Smooth Theme Canvas Blend */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at center, transparent 30%, var(--dp-bg, #f5f5f5) 95%)",
        }}
      />
      <KineticGrid
        dotColor="rgba(249, 145, 73, 0.55)"
        lineColor="rgba(249, 145, 73, 0.45)"
        trailColor="rgba(241, 137, 64, 0.9)"
        spacing={44}
        radius={280}
        strength={4}
        trail={true}
      />
    </div>
  );
};

export default function AuthLayout({
  pageTitle,
  pageSubtitle,
  formTitle,
  formSubtitle,
  asideTitle,
  asideDescription,
  asideBadge,
  asideItems = EMPTY_ASIDE_ITEMS,
  asideFooterTitle,
  asideFooterItems = EMPTY_ASIDE_FOOTER_ITEMS,
  alert,
  children,
}) {
  const reduceMotion = useReducedMotion();

  const shellInitial = reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 };
  const shellAnimate = { opacity: 1, y: 0 };
  const shellTransition = {
    duration: reduceMotion ? 0 : 0.35,
    ease: "easeOut",
  };

  const blockInitial = reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 };
  const blockAnimate = { opacity: 1, y: 0 };
  const blockTransition = {
    duration: reduceMotion ? 0 : 0.3,
    ease: "easeOut",
    delay: reduceMotion ? 0 : 0.08,
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="bg-canvas text-ink min-h-screen relative overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true" />
        <TopBar />
        <GlowBackdrop />

        <main className="relative z-10 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
          <MotionDiv
            initial={shellInitial}
            animate={shellAnimate}
            transition={shellTransition}
            className="max-w-[896px] mx-auto rounded-xl bg-surface-card border border-hairline overflow-hidden shadow-xl"
          >
            <div className="px-6 py-5 sm:px-10 sm:py-6 border-b border-hairline bg-canvas-soft">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-ink">
                {pageTitle}
              </h1>
              {pageSubtitle ? <p className="mt-1 text-sm text-body">{pageSubtitle}</p> : null}
            </div>

            <div className="flex flex-col lg:flex-row">
              <aside className="hidden lg:block lg:w-1/2 bg-canvas-soft p-8 border-r border-hairline">
                <MotionDiv
                  initial={blockInitial}
                  animate={blockAnimate}
                  transition={blockTransition}
                  className="h-full flex flex-col justify-center"
                >
                  <div className="space-y-6">
                    <div>
                      {asideBadge ? (
                        <div className="inline-flex items-center gap-2 border border-hairline bg-surface-strong text-ink px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.08em] mb-4">
                          {asideBadge}
                        </div>
                      ) : null}

                      {asideTitle ? (
                        <h2 className="text-xl font-semibold text-ink mb-3">{asideTitle}</h2>
                      ) : null}
                      {asideDescription ? (
                        <p className="text-body leading-relaxed">{asideDescription}</p>
                      ) : null}
                    </div>

                    {asideItems?.length ? (
                      <div className="space-y-4">
                        {asideItems.map(({ Icon, title, description }) => (
                          <div
                            key={title || description || "aside-item"}
                            className="flex items-start gap-3"
                          >
                            {Icon ? <Icon className="text-primary mt-0.5" size={20} /> : null}
                            <div>
                              <h3 className="font-medium text-ink">{title}</h3>
                              <p className="text-sm text-body">{description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {asideFooterTitle || asideFooterItems?.length ? (
                      <div className="rounded-xl border border-hairline bg-surface-card p-4">
                        {asideFooterTitle ? (
                          <h3 className="font-medium text-ink mb-2">{asideFooterTitle}</h3>
                        ) : null}
                        {asideFooterItems?.length ? (
                          <ul className="space-y-1 text-sm text-body">
                            {asideFooterItems.map((line) => (
                              <li key={line}>{line}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </MotionDiv>
              </aside>

              <section className="w-full lg:w-1/2 p-6 sm:p-10 bg-surface-card">
                <MotionDiv
                  initial={blockInitial}
                  animate={blockAnimate}
                  transition={{
                    ...blockTransition,
                    delay: reduceMotion ? 0 : 0.12,
                  }}
                  className="h-full flex flex-col justify-center"
                >
                  <div className="max-w-[384px] mx-auto w-full">
                    <div className="text-center mb-6 sm:mb-8">
                      {formTitle ? (
                        <h2 className="text-xl sm:text-2xl font-bold text-ink mb-2">{formTitle}</h2>
                      ) : null}
                      {formSubtitle ? (
                        <p className="text-sm sm:text-base text-body">{formSubtitle}</p>
                      ) : null}
                    </div>

                    {alert ? <div className="mb-4">{alert}</div> : null}

                    {children}
                  </div>
                </MotionDiv>
              </section>
            </div>
          </MotionDiv>
        </main>
        <Footer />
      </div>
    </LazyMotion>
  );
}
