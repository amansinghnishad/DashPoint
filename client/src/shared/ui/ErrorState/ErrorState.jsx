import NightSceneBacklit from "./NightSceneBacklit";

export default function ErrorState({
  code,
  eyebrow = "Something went wrong",
  title,
  description,
  children,
}) {
  return (
    <main
      className="fixed inset-0 z-[100] grid min-h-[100dvh] w-full place-items-center overflow-hidden bg-[#171216] px-6 py-8 text-white"
      style={{ isolation: "isolate" }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <NightSceneBacklit
          background="#171216"
          blossomColor="#f1a9bd"
          speed={24}
          petals={72}
          wind={18}
          glow={34}
          hover={0}
          advanced={{
            flowers: 2800,
            flowerSize: 5,
            clumpSize: 11,
            twigs: 25,
            branchColor: "#60434c",
            petalColor: "#f3d9e0",
            grain: 3,
            vignette: 48,
            hover: 0,
          }}
          style={{ minWidth: 0, minHeight: 0 }}
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(20,12,17,0.12)_0%,rgba(20,12,17,0.28)_58%,rgba(20,12,17,0.58)_100%)]"
      />

      <section
        aria-labelledby="error-state-title"
        className="absolute left-1/2 top-1/2 z-10 flex min-w-0 -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center md:left-[70%]"
        style={{
          width: "672px",
          maxWidth: "calc(100vw - 3rem)",
          minWidth: 0,
        }}
      >
        {code ? (
          <p className="font-display text-7xl leading-none tracking-tight text-[#ffb078] drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)] sm:text-8xl">
            {code}
          </p>
        ) : null}
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
          {eyebrow}
        </p>
        <h1
          id="error-state-title"
          className="mt-3 font-display text-3xl font-semibold tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)] sm:text-4xl"
        >
          {title}
        </h1>
        <p
          className="mt-4 w-full max-w-xl text-sm leading-6 text-white/80 sm:text-base"
          style={{ width: "100%", maxWidth: "36rem" }}
        >
          {description}
        </p>

        {children ? (
          <div className="mt-8 flex w-full flex-col-reverse items-center justify-center gap-3 sm:flex-row">
            {children}
          </div>
        ) : null}
      </section>
    </main>
  );
}
