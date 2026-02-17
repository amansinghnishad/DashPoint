export default function ChatCommandBar({
  commands,
  visibleCommandList,
  commandMenuOpen,
  onSelect,
  onToggleMenu,
}) {
  return (
    <>
      <div className="mb-2 flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 overflow-x-auto">
          {commands.map((c) => (
            <button
              key={c.id}
              type="button"
              className="dp-btn-secondary shrink-0 rounded-xl px-3 py-2 text-xs font-semibold"
              onClick={() => onSelect(c.id)}
              title={c.hint}
            >
              /{c.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="dp-btn-secondary rounded-xl px-3 py-2 text-xs font-semibold"
          onClick={onToggleMenu}
          title="Show all commands"
        >
          Commands
        </button>
      </div>

      {visibleCommandList.length ? (
        <div className="mb-2">
          <div className="dp-surface dp-border rounded-2xl border p-2 shadow-lg">
            <p className="dp-text-muted px-2 pb-2 text-[11px] font-semibold">
              {commandMenuOpen ? "Commands" : "Suggestions"}
            </p>
            <div className="space-y-1">
              {visibleCommandList.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="dp-hover-bg dp-text-muted hover:dp-text flex w-full items-start justify-between gap-3 rounded-xl px-2 py-2 text-left text-sm"
                  onClick={() => onSelect(c.id)}
                >
                  <span className="font-semibold">/{c.id}</span>
                  <span className="dp-text-subtle text-xs">{c.hint}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
