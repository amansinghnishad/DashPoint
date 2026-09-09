import { useRef, useState } from "react";
import { Link } from "react-router-dom";

import { APP_ROUTES } from "../../../app/routes/paths";
import Footer from "../../../shared/ui/Footer/Footer";
import TopBar from "../../../shared/ui/Navbars/TopBar";
import FloatingInstallDownloadButtons from "../../../shared/ui/PWAStatus/FloatingInstallDownloadButtons";
import ChatAssistantShowcase from "../components/ChatAssistantShowcase";
import KineticGrid from "../components/KineticGrid";
import KnowledgeCanvasShowcase from "../components/KnowledgeCanvasShowcase";
import SmartCalendarShowcase from "../components/SmartCalendarShowcase";

export default function LandingPage() {
  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);
  const videoRef3 = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleMouseEnter = () => {
    setIsPlaying(true);
    const p1 = videoRef1.current?.play();
    const p2 = videoRef2.current?.play();
    const p3 = videoRef3.current?.play();
    Promise.all([p1, p2, p3]).catch(() => { });
  };

  const handleMouseLeave = () => {
    setIsPlaying(false);
    videoRef1.current?.pause();
    videoRef2.current?.pause();
    videoRef3.current?.pause();
  };

  const togglePlay = (e) => {
    if (e.target.closest("a[href*='/register']")) return;
    if (isPlaying) {
      handleMouseLeave();
    } else {
      handleMouseEnter();
    }
  };

  return (
    <div className="bg-canvas text-ink min-h-screen font-sans antialiased selection:bg-ink/10 overflow-x-hidden">
      {/* Navigation */}
      <TopBar />

      <main className="overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-28 sm:pt-36 pb-8 sm:pb-12">
          {/* Orange Gradient Glow Backdrop & Kinetic Interactive Grid */}
          <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
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

          {/* Hero Content */}
          <div className="relative z-20 max-w-[1280px] mx-auto w-full px-4 sm:px-8 md:px-xxl flex flex-col items-center text-center pt-8 sm:pt-16">
            <div className="inline-block border border-hairline bg-surface-card/80 backdrop-blur-md px-3.5 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.2em] mb-6 sm:mb-12 text-ink/80 shadow-sm">
              PRECISION TOOLS
            </div>

            <div className="relative mb-6 sm:mb-12">
              <h1 className="font-waldenburg-light text-4xl sm:text-6xl md:text-[80px] leading-[1.1] sm:leading-tight hero-heading text-ink relative z-10">
                Your productivity,
                <br />
                <span className="italic opacity-50 block -mt-1 sm:-mt-2">articulated.</span>
              </h1>
              {/* Layered blurring shadow effect */}
              <h1 className="absolute inset-0 font-waldenburg-light text-4xl sm:text-6xl md:text-[80px] leading-[1.1] sm:leading-tight hero-heading text-ink/15 blur-[4px] translate-x-[2px] sm:translate-x-[4px] translate-y-[2px] sm:translate-y-[4px] -z-10 pointer-events-none select-none">
                Your productivity,
                <br />
                <span className="italic block -mt-1 sm:-mt-2">articulated.</span>
              </h1>
            </div>

            <div
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={togglePlay}
              className="relative w-full max-w-[1150px] mt-6 sm:mt-14 md:mt-24 flex items-center justify-center select-none group cursor-pointer"
            >
              {/* Left Video Panel (visible on all screens including mobile) */}
              <Link
                to={APP_ROUTES.REGISTER}
                className="absolute w-[82%] sm:w-[88%] md:w-full max-w-[950px] aspect-video bg-canvas-soft border border-hairline rounded-xl sm:rounded-2xl md:rounded-[32px] overflow-hidden shadow-lg z-10 transition-all duration-500 -translate-x-[9%] sm:-translate-x-[18%] md:-translate-x-[25%] scale-[0.88] opacity-35 sm:opacity-30 group-hover:opacity-60 group-hover:-translate-x-[12%] sm:group-hover:-translate-x-[24%] md:group-hover:-translate-x-[32%] group-hover:scale-[0.9] hover:z-30 hover:!scale-[0.98] hover:!opacity-100 hover:!-translate-x-[14%] sm:hover:!-translate-x-[28%] md:hover:!-translate-x-[38%] hover:shadow-2xl"
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

              {/* Right Video Panel (visible on all screens including mobile) */}
              <Link
                to={APP_ROUTES.REGISTER}
                className="absolute w-[82%] sm:w-[88%] md:w-full max-w-[950px] aspect-video bg-canvas-soft border border-hairline rounded-xl sm:rounded-2xl md:rounded-[32px] overflow-hidden shadow-lg z-10 transition-all duration-500 translate-x-[9%] sm:translate-x-[18%] md:translate-x-[25%] scale-[0.88] opacity-35 sm:opacity-30 group-hover:opacity-60 group-hover:translate-x-[12%] sm:group-hover:translate-x-[24%] md:group-hover:translate-x-[32%] group-hover:scale-[0.9] hover:z-30 hover:!scale-[0.98] hover:!opacity-100 hover:!translate-x-[14%] sm:hover:!translate-x-[28%] md:hover:!translate-x-[38%] hover:shadow-2xl"
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

              {/* Main Video Link (centered, on top, fully responsive) */}
              <div
                className="relative w-[82%] sm:w-[88%] md:w-full max-w-[950px] aspect-video bg-canvas-soft border border-hairline rounded-xl sm:rounded-2xl md:rounded-[32px] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.14)] sm:shadow-[0_16px_44px_rgba(0,0,0,0.16)] md:shadow-[0_24px_60px_rgba(0,0,0,0.16)] z-20 transition-all duration-500 group-hover:scale-[1.01] sm:group-hover:scale-[1.02] group-hover:shadow-[0_20px_48px_rgba(0,0,0,0.18)] md:group-hover:shadow-[0_32px_80px_rgba(0,0,0,0.22)] flex items-center justify-center"
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
                <div className={`absolute flex flex-col items-center gap-1.5 sm:gap-3 transition-all duration-500 ${isPlaying ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"}`}>
                  <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center border border-white/40 transition-transform duration-300 group-hover:scale-110">
                    {/* Play Icon */}
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-neutral-900 fill-current translate-x-0.5" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <span className="text-white text-[9px] sm:text-[11px] md:text-xs font-semibold tracking-wide drop-shadow-md">
                    Watch DashPoint in Action
                  </span>
                </div>

                {/* Floating CTA Bottom Right */}
                <Link
                  to={APP_ROUTES.REGISTER}
                  className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 md:bottom-6 md:right-6 bg-ink text-canvas px-3 py-1 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-full text-[10px] sm:text-xs font-semibold shadow-lg border border-neutral-800/20 hover:bg-neutral-900 transition-all z-10 flex items-center gap-1 sm:gap-2 group-hover:scale-105 duration-300"
                >
                  <span>Get Started</span>
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-canvas transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
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
              {/* Entry 1: Interactive Chat Showcase */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-center border-t border-hairline pt-12">
                <div className="lg:col-span-4">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="font-waldenburg-light text-3xl opacity-20">01</span>
                    <h3 className="font-waldenburg-light text-3xl">AI Chat Assistant</h3>
                  </div>
                  <p className="text-base text-on-surface-variant leading-relaxed mb-8">
                    Conversational RAG with real-time SSE token streaming, memory context, and multi-tier model routing. Try clicking the prompt suggestions in the live demo.
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
                <div className="lg:col-span-7 lg:col-start-6 mx-auto w-full max-w-[760px] transform-gpu transition-transform duration-500 lg:rotate-[1deg] lg:hover:rotate-0 motion-reduce:transform-none motion-reduce:transition-none">
                  <ChatAssistantShowcase />
                </div>
              </div>

              {/* Entry 2: Interactive Smart Calendar Showcase */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-center border-t border-hairline pt-12">
                <div className="lg:col-span-7 order-2 lg:order-1 mx-auto w-full max-w-[760px] transform-gpu transition-transform duration-500 lg:-rotate-[1deg] lg:hover:rotate-0 motion-reduce:transform-none motion-reduce:transition-none">
                  <SmartCalendarShowcase />
                </div>
                <div className="lg:col-span-4 lg:col-start-9 order-1 lg:order-2">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="font-waldenburg-light text-3xl opacity-20">02</span>
                    <h3 className="font-waldenburg-light text-3xl">Smart Calendar</h3>
                  </div>
                  <p className="text-base text-on-surface-variant leading-relaxed mb-8">
                    AI-assisted scheduling with smart interval merging and Google Calendar bidirectional sync. Click timetable chips to mark tasks complete.
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

              {/* Entry 3: Interactive Infinite Knowledge Canvas Showcase */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-center border-t border-hairline pt-12">
                <div className="lg:col-span-4">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="font-waldenburg-light text-3xl opacity-20">03</span>
                    <h3 className="font-waldenburg-light text-3xl">Unified Canvas</h3>
                  </div>
                  <p className="text-base text-on-surface-variant leading-relaxed mb-8">
                    Combine interactive todo lists, audio dictation waveforms, and video transcript insights in one focused workspace.
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
                <div className="lg:col-span-7 lg:col-start-6 mx-auto w-full max-w-[760px] transform-gpu transition-transform duration-500 lg:rotate-[1deg] lg:hover:rotate-0 motion-reduce:transform-none motion-reduce:transition-none">
                  <KnowledgeCanvasShowcase />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section className="px-xl md:px-xxl py-section bg-canvas-soft text-center" id="manifesto">
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
            <div className="bg-neutral-900 border border-neutral-800 text-white p-12 md:p-24 rounded-[40px] relative overflow-hidden group shadow-xl">
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="font-waldenburg-light text-4xl mb-6 text-white">Engineered for Convenience</h2>
                  <p className="text-neutral-300 text-lg leading-relaxed">
                    Automate the routine, organize the chaos, and execute without hesitation. Experience a platform built to keep you in deep focus, anywhere, anytime.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-8 lg:justify-end">
                  <span className="font-waldenburg-light text-2xl text-neutral-400 hover:text-white transition-colors cursor-default tracking-wide">
                    INTELLIGENT
                  </span>
                  <span className="font-waldenburg-light text-2xl text-neutral-400 hover:text-white transition-colors cursor-default tracking-wide">
                    AUTOMATED
                  </span>
                  <span className="font-waldenburg-light text-2xl text-neutral-400 hover:text-white transition-colors cursor-default tracking-wide">
                    RESPONSIVE
                  </span>
                  <span className="font-waldenburg-light text-2xl text-neutral-400 hover:text-white transition-colors cursor-default tracking-wide">
                    SECURE
                  </span>
                </div>
              </div>
              {/* Subtle glow effect */}
              <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-[100px]" />
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
