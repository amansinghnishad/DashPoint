export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
}) {
  const alignClass = align === "left" ? "text-left" : "text-center";

  return (
    <div
      className={`${alignClass} max-w-3xl ${align === "left" ? "" : "mx-auto"}`}
    >
      {eyebrow ? (
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-slate-700 backdrop-blur">
          {eyebrow}
        </div>
      ) : null}
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}