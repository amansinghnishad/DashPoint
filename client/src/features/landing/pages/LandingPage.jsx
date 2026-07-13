import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

import { APP_ROUTES } from "../../../app/routes/paths";
import Footer from "../../../shared/ui/Footer/Footer";
import FloatingInstallDownloadButtons from "../../../shared/ui/PWAStatus/FloatingInstallDownloadButtons";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);
  const videoRef3 = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleMouseEnter = () => {
    setIsPlaying(true);
    const p1 = videoRef1.current?.play();
    const p2 = videoRef2.current?.play();
    const p3 = videoRef3.current?.play();
    Promise.all([p1, p2, p3]).catch(() => {});
  };

  const handleMouseLeave = () => {
    setIsPlaying(false);
    videoRef1.current?.pause();
    videoRef2.current?.pause();
    videoRef3.current?.pause();
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-canvas text-ink min-h-screen font-sans antialiased selection:bg-ink/10">
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 flex justify-between items-center transition-all duration-500 px-xl md:px-xxl ${isScrolled
            ? "bg-white/80 backdrop-blur-lg h-16 border-b border-hairline"
            : "h-20"
          }`}
      >
        <div className="flex items-center gap-xl">
          <Link
            to={APP_ROUTES.HOME}
            className="font-waldenburg-light text-2xl tracking-tight text-ink"
          >
            DASHPOINT
          </Link>
          <div className="hidden md:flex gap-lg">
            <a
              href="#capabilities"
              className="text-[15px] font-medium text-on-surface-variant hover:text-ink transition-colors"
            >
              Capabilities
            </a>
            <a
              href="#manifesto"
              className="text-[15px] font-medium text-on-surface-variant hover:text-ink transition-colors"
            >
              Manifesto
            </a>
          </div>
        </div>
        <div className="flex items-center gap-base">
          <Link
            to={APP_ROUTES.LOGIN}
            className="hidden md:block text-[15px] font-medium text-on-surface-variant hover:text-ink transition-colors"
          >
            Sign In
          </Link>
          <Link
            to={APP_ROUTES.REGISTER}
            className="bg-ink text-canvas px-8 py-2.5 rounded-full text-[15px] font-medium hover:opacity-90 transition-opacity flex items-center justify-center"
          >
            Try free
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-36 pb-12">
          {/* Orange Gradient Background Circle Fade */}
          <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(circle at center, rgba(255, 255, 255, 0) 0%, #f5f5f5 90%)",
              }}
            />
            <div
              className="absolute top-[-250px] left-1/2 -translate-x-1/2 w-[1000px] h-[900px] rounded-full"
              style={{
                background: "linear-gradient(to bottom, rgba(254, 215, 170, 0.85), rgba(255, 237, 213, 0.3), transparent)",
                filter: "blur(80px)",
                WebkitFilter: "blur(80px)",
              }}
            />
            <div
              className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full"
              style={{
                background: "rgba(253, 186, 116, 0.15)",
                filter: "blur(140px)",
                WebkitFilter: "blur(140px)",
              }}
            />
          </div>

          {/* Hero Content */}
          <div className="relative z-20 max-w-[1280px] mx-auto w-full px-xl md:px-xxl flex flex-col items-center text-center pt-16">
            <div className="inline-block glass-card px-4 py-1 rounded-full text-[12px] font-semibold uppercase tracking-[0.2em] mb-12 text-ink/80">
              PRECISION TOOLS
            </div>

            <div className="relative mb-12">
              <h1 className="font-waldenburg-light text-6xl md:text-[80px] hero-heading text-ink relative z-10">
                Your productivity,
                <br />
                <span className="italic opacity-50 block -mt-2">articulated.</span>
              </h1>
              {/* Layered blurring shadow effect */}
              <h1 className="absolute inset-0 font-waldenburg-light text-6xl md:text-[80px] hero-heading text-canvas/30 blur-[2px] translate-x-[4px] translate-y-[4px] -z-10 pointer-events-none select-none">
                Your productivity,
                <br />
                <span className="italic block -mt-2">articulated.</span>
              </h1>
            </div>

            <div
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="relative w-full max-w-[1150px] mt-24 flex items-center justify-center select-none group"
            >
              {/* Left Video Panel (shifted left relative to center, scaled down, behind) */}
              <Link
                to={APP_ROUTES.REGISTER}
                className="absolute w-full max-w-[950px] aspect-video bg-canvas-soft border border-hairline rounded-[32px] overflow-hidden shadow-lg z-10 transition-all duration-500 -translate-x-[25%] scale-[0.88] opacity-30 group-hover:opacity-60 group-hover:-translate-x-[32%] group-hover:scale-[0.9] hover:z-30 hover:!scale-[0.98] hover:!opacity-100 hover:!-translate-x-[38%] hover:shadow-2xl"
              >
                <video
                  ref={videoRef2}
                  className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 group-hover:grayscale-0 transition-all duration-700"
                  muted
                  loop
                  playsInline
                  src="/showCase/calendar.mp4"
                />
                <div className="absolute inset-0 bg-black/5" />
              </Link>

              {/* Right Video Panel (shifted right relative to center, scaled down, behind) */}
              <Link
                to={APP_ROUTES.REGISTER}
                className="absolute w-full max-w-[950px] aspect-video bg-canvas-soft border border-hairline rounded-[32px] overflow-hidden shadow-lg z-10 transition-all duration-500 translate-x-[25%] scale-[0.88] opacity-30 group-hover:opacity-60 group-hover:translate-x-[32%] group-hover:scale-[0.9] hover:z-30 hover:!scale-[0.98] hover:!opacity-100 hover:!translate-x-[38%] hover:shadow-2xl"
              >
                <video
                  ref={videoRef3}
                  className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 group-hover:grayscale-0 transition-all duration-700"
                  muted
                  loop
                  playsInline
                  src="/showCase/resize.mp4"
                />
                <div className="absolute inset-0 bg-black/5" />
              </Link>

              {/* Main Video Link (centered, on top) */}
              <Link
                to={APP_ROUTES.REGISTER}
                className="relative w-full max-w-[950px] aspect-video bg-canvas-soft border border-hairline rounded-[32px] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.16)] z-20 cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_32px_80px_rgba(0,0,0,0.22)] flex items-center justify-center"
              >
                <video
                  ref={videoRef1}
                  className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity duration-500"
                  muted
                  loop
                  playsInline
                  src="/1.mp4"
                />
                
                {/* Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

                {/* Center Play Button Overlay */}
                <div className={`absolute flex flex-col items-center gap-3 transition-all duration-500 ${isPlaying ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"}`}>
                  <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center border border-white/40 transition-transform duration-300 group-hover:scale-110">
                    {/* Play Icon */}
                    <svg className="w-6 h-6 text-neutral-900 fill-current translate-x-0.5" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <span className="text-white text-xs font-semibold tracking-wide drop-shadow-md">
                    Watch DashPoint in Action
                  </span>
                </div>

                {/* Floating CTA Bottom Right */}
                <div className="absolute bottom-6 right-6 bg-ink text-canvas px-6 py-3 rounded-full text-xs font-semibold shadow-lg border border-neutral-800/20 hover:bg-neutral-900 transition-colors z-10 flex items-center gap-2 group-hover:scale-105 duration-300">
                  <span>Get Started</span>
                  <svg className="w-3.5 h-3.5 text-canvas transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Atmos Section */}
        <section className="px-xl md:px-xxl py-section flex items-center justify-center overflow-hidden">
          <h2 className="font-waldenburg-light text-[18vw] leading-none opacity-[0.03] select-none pointer-events-none tracking-tighter uppercase whitespace-nowrap">
            INTELLIGENCE
          </h2>
        </section>

        {/* Journal Section */}
        <section className="px-xl md:px-xxl py-section bg-canvas relative" id="capabilities">
          <div className="max-w-[1280px] mx-auto">
            <div className="mb-24">
              <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-on-tertiary-container mb-4">
                CAPABILITIES
              </p>
              <h2 className="font-waldenburg-light text-4xl md:text-5xl text-ink">
                A Journal of Enhanced Workflow
              </h2>
            </div>

            {/* Journal Entries */}
            <div className="space-y-section">
              {/* Entry 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-center border-t border-hairline pt-12">
                <div className="lg:col-span-4">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="font-waldenburg-light text-3xl opacity-20">01</span>
                    <h3 className="font-waldenburg-light text-3xl">AI Chat Assistant</h3>
                  </div>
                  <p className="text-base text-on-surface-variant leading-relaxed mb-8">
                    Conversational RAG (Retrieval-Augmented Generation) with direct tool-calling capabilities to interact with your data in real-time.
                  </p>
                  <Link
                    to={APP_ROUTES.REGISTER}
                    className="inline-flex items-center gap-2 text-[15px] font-medium text-ink group"
                  >
                    Explore Chat{" "}
                    <span className="material-symbols-outlined text-base group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                      north_east
                    </span>
                  </Link>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <div className="p-2 bg-white/50 backdrop-blur shadow-2xl rounded-xl rotate-1 group overflow-hidden">
                    <img
                      alt="AI Interface"
                      className="w-full rounded-lg grayscale hover:grayscale-0 transition-all duration-700"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuC01MXfHm-RUFqeY_ZHdREfxqwMA1POah1BStq-oyQ2rjUqt6soHN6liZSOqNA8OanxQx84SS7GrziTl7FSk2GPM5e3XTwAmwMBykSb_Bx7g9wrCqWj4b8iyzYbul0Mns3po20eLPilmhOMi06ot1aIKCgSxN76cr0rBPh5ofp1Yh6-SrSJC9TNG7ZZ4e7FDMUmAAYub57D7Y-xKtoveVRsfzNo4E_wmANwdNEi6XdHjtfMfohYuk2l8Q"
                    />
                  </div>
                </div>
              </div>

              {/* Entry 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-center border-t border-hairline pt-12">
                <div className="lg:col-span-7 order-2 lg:order-1">
                  <div className="p-2 bg-white/50 backdrop-blur shadow-2xl rounded-xl -rotate-1 group overflow-hidden">
                    <img
                      alt="Smart Calendar"
                      className="w-full rounded-lg grayscale hover:grayscale-0 transition-all duration-700"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJkJlOR48fnsHHufUGErRonOXtxyzarfybTANPg182OocSVRXLpRuDmsnqLmW0QEJYssLlLjyb8RaJP8pUlLalO5iW9LmjZy8uT9K69OAk3N2TgH8CiBak_lDOB68JoIhUE8fnc3b3X8n7NcYI838hizLKbJLdRUmvmoyfbJuaFLrQy8twu5g6WYmBGpEjY39JAqOsq2RI7NwPFNZNrXwH5khcE1RY3ydpLxQzUKiyNaWWyIfR_L5ttA"
                    />
                  </div>
                </div>
                <div className="lg:col-span-4 lg:col-start-9 order-1 lg:order-2">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="font-waldenburg-light text-3xl opacity-20">02</span>
                    <h3 className="font-waldenburg-light text-3xl">Smart Calendar</h3>
                  </div>
                  <p className="text-base text-on-surface-variant leading-relaxed mb-8">
                    AI-assisted scheduling and planning that understands your context, availability, and energy levels automatically.
                  </p>
                  <Link
                    to={APP_ROUTES.REGISTER}
                    className="inline-flex items-center gap-2 text-[15px] font-medium text-ink group"
                  >
                    Sync Events{" "}
                    <span className="material-symbols-outlined text-base group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                      north_east
                    </span>
                  </Link>
                </div>
              </div>

              {/* Entry 3 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-center border-t border-hairline pt-12">
                <div className="lg:col-span-4">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="font-waldenburg-light text-3xl opacity-20">03</span>
                    <h3 className="font-waldenburg-light text-3xl">Unified Management</h3>
                  </div>
                  <p className="text-base text-on-surface-variant leading-relaxed mb-8">
                    Access YouTube videos, research files, and meeting notes in one unified, intelligent interface designed for pure focus.
                  </p>
                  <Link
                    to={APP_ROUTES.REGISTER}
                    className="inline-flex items-center gap-2 text-[15px] font-medium text-ink group"
                  >
                    Organize Data{" "}
                    <span className="material-symbols-outlined text-base group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                      north_east
                    </span>
                  </Link>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <div className="p-2 bg-white/50 backdrop-blur shadow-2xl rounded-xl rotate-2 group overflow-hidden">
                    <img
                      alt="File Hub"
                      className="w-full rounded-lg grayscale hover:grayscale-0 transition-all duration-700"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7LDA7NoIKnVmf8kQ2F3wUb_oj3scItDey-YhEfafAAp6Moud2oZSIjo6lNarwnyf9xhExv0IOQagVxyBoMTG1kWT8JErwoGSIftS6y70JU9AWb2nZBzgIJ3xLrlueCnFxNkW6Rlp7UW7ABxGJhMDmYjSyXA_CyP3K23CsSC_9RGUhdQTdoquFAEXdtWL0GiiY3ANHyHx8CtrYncrQZDjQhJbT7jVz1nW-GKTMu_wA2iwggTSaUeUE2w"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section className="px-xl md:px-xxl py-section bg-white text-center" id="manifesto">
          <div className="max-w-[896px] mx-auto">
            <div className="mb-12">
              <span className="font-waldenburg-light text-7xl text-ink/20 opacity-40">99</span>
            </div>
            <p className="font-waldenburg-light text-3xl md:text-5xl leading-tight text-ink italic mb-10">
              "The future of work isn't just about speed; it's about the precision of your articulation."
            </p>
            <p className="text-[12px] font-semibold tracking-[0.2em] text-on-surface-variant uppercase">
              — DASHPOINT MANIFESTO
            </p>
          </div>
        </section>

        {/* Stack Section */}
        <section className="px-xl md:px-xxl py-section">
          <div className="max-w-[1280px] mx-auto">
            <div className="bg-ink text-canvas p-12 md:p-24 rounded-[40px] relative overflow-hidden group">
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="font-waldenburg-light text-4xl mb-6">Engineered for Performance</h2>
                  <p className="text-canvas/70 text-lg leading-relaxed">
                    Built with the MERN stack for speed and scale. Experience real-time synchronization and near-zero latency across all your connected devices.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-8 lg:justify-end">
                  <span className="font-waldenburg-light text-2xl opacity-40 hover:opacity-100 transition-opacity cursor-default">
                    MONGODB
                  </span>
                  <span className="font-waldenburg-light text-2xl opacity-40 hover:opacity-100 transition-opacity cursor-default">
                    EXPRESS
                  </span>
                  <span className="font-waldenburg-light text-2xl opacity-40 hover:opacity-100 transition-opacity cursor-default">
                    REACT
                  </span>
                  <span className="font-waldenburg-light text-2xl opacity-40 hover:opacity-100 transition-opacity cursor-default">
                    NODE
                  </span>
                </div>
              </div>
              {/* Subtle glow effect */}
              <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-canvas/5 rounded-full blur-[100px]" />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-xl md:px-xxl py-section text-center relative overflow-hidden">
          <div className="max-w-[896px] mx-auto">
            <h2 className="font-waldenburg-light text-5xl md:text-[80px] leading-none mb-10 tight-tracking">
              Ready to streamline?
            </h2>
            <p className="text-lg text-on-surface-variant mb-16 max-w-[576px] mx-auto">
              Join the next generation of productive teams who articulate their vision through DashPoint.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <Link
                to={APP_ROUTES.REGISTER}
                className="bg-ink text-canvas px-12 py-5 rounded-full font-medium text-lg hover:shadow-2xl transition-all flex items-center justify-center"
              >
                Start for free
              </Link>
              <Link
                to={APP_ROUTES.REGISTER}
                className="flex items-center gap-2 font-medium text-lg group"
              >
                Contact Sales{" "}
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                  keyboard_arrow_right
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* PWA Floating Download Button */}
      <FloatingInstallDownloadButtons />
    </div>
  );
}
