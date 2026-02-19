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
        <div className="inline-flex items-center rounded-full dp-border border dp-surface-muted px-3 py-1 text-xs font-medium dp-text-soft backdrop-blur">
          {eyebrow}
        </div>
      ) : null}

      <h2 className="mt-4 text-3xl font-semibold tracking-tight dp-text sm:text-4xl">
        {title}
      </h2>

      {description ? (
        <p className="mt-4 text-base leading-7 dp-text-muted sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
