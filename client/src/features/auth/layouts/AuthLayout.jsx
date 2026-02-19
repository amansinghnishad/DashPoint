import Footer from "../../../shared/ui/Footer/Footer";
import TopBar from "../../../shared/ui/Navbars/TopBar";

const EMPTY_ASIDE_ITEMS = [];
const EMPTY_ASIDE_FOOTER_ITEMS = [];

const GlowBackdrop = () => {
  return (
    <div
      className="dp-glow pointer-events-none absolute inset-0"
      aria-hidden="true"
    >
      <div className="absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-indigo-600/40 blur-3xl" />
      <div className="absolute -bottom-24 right-[-10rem] h-72 w-[36rem] rounded-full bg-amber-400/20 blur-3xl" />
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
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      <TopBar />
      <GlowBackdrop />

      <main className="relative z-10 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto rounded-3xl bg-white/5 backdrop-blur-sm shadow-2xl border border-white/10 overflow-hidden">
          <div className="px-6 py-5 sm:px-10 sm:py-6 border-b border-white/10">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
              {pageTitle}
            </h1>
            {pageSubtitle ? (
              <p className="mt-1 text-sm text-white/70">{pageSubtitle}</p>
            ) : null}
          </div>

          <div className="flex flex-col lg:flex-row">
            <aside className="hidden lg:block lg:w-1/2 bg-white/5 p-8 border-r border-white/10">
              <div className="h-full flex flex-col justify-center">
                <div className="space-y-6">
                  <div>
                    {asideBadge ? (
                      <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                        {asideBadge}
                      </div>
                    ) : null}

                    {asideTitle ? (
                      <h2 className="text-xl font-semibold text-white mb-3">
                        {asideTitle}
                      </h2>
                    ) : null}
                    {asideDescription ? (
                      <p className="text-white/70 leading-relaxed">
                        {asideDescription}
                      </p>
                    ) : null}
                  </div>

                  {asideItems?.length ? (
                    <div className="space-y-4">
                      {asideItems.map(({ Icon, title, description }) => (
                        <div
                          key={title || description || "aside-item"}
                          className="flex items-start gap-3"
                        >
                          {Icon ? (
                            <Icon className="text-amber-300 mt-0.5" size={20} />
                          ) : null}
                          <div>
                            <h3 className="font-medium text-white">{title}</h3>
                            <p className="text-sm text-white/70">
                              {description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {asideFooterTitle || asideFooterItems?.length ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      {asideFooterTitle ? (
                        <h3 className="font-medium text-white mb-2">
                          {asideFooterTitle}
                        </h3>
                      ) : null}
                      {asideFooterItems?.length ? (
                        <ul className="space-y-1 text-sm text-white/70">
                          {asideFooterItems.map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </aside>

            <section className="w-full lg:w-1/2 p-6 sm:p-10">
              <div className="h-full flex flex-col justify-center">
                <div className="max-w-sm mx-auto w-full">
                  <div className="text-center mb-6 sm:mb-8">
                    {formTitle ? (
                      <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                        {formTitle}
                      </h2>
                    ) : null}
                    {formSubtitle ? (
                      <p className="text-sm sm:text-base text-white/70">
                        {formSubtitle}
                      </p>
                    ) : null}
                  </div>

                  {alert ? <div className="mb-4">{alert}</div> : null}

                  {children}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer embedded />
    </div>
  );
}
