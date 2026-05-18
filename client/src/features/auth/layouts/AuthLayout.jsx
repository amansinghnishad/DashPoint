import { LazyMotion, domAnimation, motion, useReducedMotion } from "framer-motion";

import Footer from "../../../shared/ui/Footer/Footer";
import TopBar from "../../../shared/ui/Navbars/TopBar";

const EMPTY_ASIDE_ITEMS = [];
const EMPTY_ASIDE_FOOTER_ITEMS = [];
const MotionDiv = motion.div;

const GlowBackdrop = () => {
  return (
    <div className="dp-glow pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-white/15 blur-3xl" />
      <div className="absolute -bottom-24 right-[-10rem] h-72 w-[36rem] rounded-full bg-white/10 blur-3xl" />
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
      <div className="dp-bg dp-text min-h-screen relative overflow-hidden">
        <div className="dp-showcase-bg absolute inset-0" aria-hidden="true" />
        <TopBar />
        <GlowBackdrop />

        <main className="relative z-10 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
          <MotionDiv
            initial={shellInitial}
            animate={shellAnimate}
            transition={shellTransition}
            className="max-w-4xl mx-auto rounded-3xl dp-surface backdrop-blur-sm shadow-2xl border dp-border overflow-hidden"
          >
            <div className="px-6 py-5 sm:px-10 sm:py-6 border-b dp-border">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight dp-text">
                {pageTitle}
              </h1>
              {pageSubtitle ? <p className="mt-1 text-sm dp-text-muted">{pageSubtitle}</p> : null}
            </div>

            <div className="flex flex-col lg:flex-row">
              <aside className="hidden lg:block lg:w-1/2 dp-surface-muted p-8 border-r dp-border">
                <MotionDiv
                  initial={blockInitial}
                  animate={blockAnimate}
                  transition={blockTransition}
                  className="h-full flex flex-col justify-center"
                >
                  <div className="space-y-6">
                    <div>
                      {asideBadge ? (
                        <div className="inline-flex items-center gap-2 border dp-border dp-surface-muted dp-text px-4 py-2 rounded-full text-sm font-medium mb-4">
                          {asideBadge}
                        </div>
                      ) : null}

                      {asideTitle ? (
                        <h2 className="text-xl font-semibold dp-text mb-3">{asideTitle}</h2>
                      ) : null}
                      {asideDescription ? (
                        <p className="dp-text-muted leading-relaxed">{asideDescription}</p>
                      ) : null}
                    </div>

                    {asideItems?.length ? (
                      <div className="space-y-4">
                        {asideItems.map(({ Icon, title, description }) => (
                          <div
                            key={title || description || "aside-item"}
                            className="flex items-start gap-3"
                          >
                            {Icon ? <Icon className="dp-hero-accent mt-0.5" size={20} /> : null}
                            <div>
                              <h3 className="font-medium dp-text">{title}</h3>
                              <p className="text-sm dp-text-muted">{description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {asideFooterTitle || asideFooterItems?.length ? (
                      <div className="rounded-2xl border dp-border dp-surface p-4">
                        {asideFooterTitle ? (
                          <h3 className="font-medium dp-text mb-2">{asideFooterTitle}</h3>
                        ) : null}
                        {asideFooterItems?.length ? (
                          <ul className="space-y-1 text-sm dp-text-muted">
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

              <section className="w-full lg:w-1/2 p-6 sm:p-10">
                <MotionDiv
                  initial={blockInitial}
                  animate={blockAnimate}
                  transition={{
                    ...blockTransition,
                    delay: reduceMotion ? 0 : 0.12,
                  }}
                  className="h-full flex flex-col justify-center"
                >
                  <div className="max-w-sm mx-auto w-full">
                    <div className="text-center mb-6 sm:mb-8">
                      {formTitle ? (
                        <h2 className="text-xl sm:text-2xl font-bold dp-text mb-2">{formTitle}</h2>
                      ) : null}
                      {formSubtitle ? (
                        <p className="text-sm sm:text-base dp-text-muted">{formSubtitle}</p>
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
        <Footer embedded />
      </div>
    </LazyMotion>
  );
}
