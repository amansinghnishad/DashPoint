export default function PageIntro({ title, subtitle }) {
  return (
    <div className="mb-6 min-w-0">
      <h2 className="font-waldenburg-light text-4xl text-ink leading-tight select-none">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-2 max-w-[560px] text-sm leading-relaxed text-muted">{subtitle}</p>
      ) : null}
    </div>
  );
}
