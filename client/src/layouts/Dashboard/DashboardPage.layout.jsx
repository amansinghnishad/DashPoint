import { useMemo } from "react";

export default function DashboardPageLayout({
  title,
  searchValue,
  onSearchChange,
  addLabel = "Add",
  onAdd,
  addDisabled = false,
  items = [],
  selectedId,
  onSelect,
  renderItemTitle,
  renderItemSubtitle,
  renderItemActions,
  renderEmptySidebar,
  viewer,
}) {
  const filteredItems = useMemo(() => {
    const q = (searchValue || "").trim().toLowerCase();
    if (!q) return items;

    return items.filter((it) => {
      const t = (renderItemTitle?.(it) ?? it?.title ?? "").toString();
      const s = (renderItemSubtitle?.(it) ?? it?.subtitle ?? "").toString();
      return `${t} ${s}`.toLowerCase().includes(q);
    });
  }, [items, renderItemSubtitle, renderItemTitle, searchValue]);

  return (
    <section className="rounded-3xl border dp-border dp-surface p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="dp-text text-xl font-semibold truncate">{title}</h1>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row lg:max-w-2xl lg:justify-end">
          <div className="flex-1">
            <input
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search…"
              className="dp-surface dp-border dp-text w-full rounded-xl border px-4 py-2 text-sm outline-none"
              aria-label="Search"
            />
          </div>

          <button
            type="button"
            onClick={onAdd}
            disabled={addDisabled}
            className="dp-btn-primary inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {addLabel}
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        {/* Playlist */}
        <aside className="dp-surface dp-border rounded-2xl border p-3 lg:max-h-[72vh] lg:overflow-auto">
          {filteredItems.length ? (
            <ul className="space-y-1">
              {filteredItems.map((it) => {
                const id = it?.id ?? it?._id ?? it?.key;
                const isActive = id && selectedId && id === selectedId;

                const itemTitle = (
                  renderItemTitle?.(it) ??
                  it?.title ??
                  "Untitled"
                ).toString();
                const itemSubtitle = renderItemSubtitle?.(it);
                const actions = renderItemActions?.(it, {
                  id,
                  isActive,
                });

                return (
                  <li key={id || itemTitle}>
                    <div
                      className={`flex w-full items-stretch gap-1 rounded-xl transition-colors ${
                        isActive
                          ? "dp-sidebar-bg"
                          : "dp-hover-bg dp-text-muted dp-hover-text"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => onSelect?.(it)}
                        className="min-w-0 flex-1 px-3 py-2 text-left"
                      >
                        <p className="truncate text-sm font-semibold">
                          {itemTitle}
                        </p>
                        {itemSubtitle ? (
                          <p className="mt-0.5 truncate text-xs dp-text-subtle">
                            {itemSubtitle}
                          </p>
                        ) : null}
                      </button>

                      {actions ? (
                        <div className="flex items-center gap-1 pr-2">
                          {actions}
                        </div>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            renderEmptySidebar ?? (
              <div className="p-4 text-center">
                <p className="dp-text font-semibold">No items</p>
                <p className="dp-text-muted mt-1 text-sm">
                  Use “{addLabel}” to get started.
                </p>
              </div>
            )
          )}
        </aside>

        {/* Viewer */}
        <div className="dp-surface dp-border min-w-0 rounded-2xl border overflow-hidden">
          {viewer}
        </div>
      </div>
    </section>
  );
}
