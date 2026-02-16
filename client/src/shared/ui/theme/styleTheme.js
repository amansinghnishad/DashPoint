export const styleTheme = Object.freeze({
  layout: {
    appPage: "min-h-screen dp-bg dp-text",
  },
  text: {
    mutedSmall: "dp-text-muted text-sm",
  },
  modal: {
    overlay: "fixed inset-0 z-[80] dp-overlay backdrop-blur-sm overflow-y-auto",
    shell: "mx-auto flex min-h-full items-start justify-center p-4 sm:items-center",
    dialog:
      "dp-sidebar-surface dp-border w-full rounded-3xl border p-6 shadow-2xl flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden",
    headerRow: "flex items-start justify-between gap-3 shrink-0",
    body: "mt-6 overflow-y-auto",
    footer: "mt-6 shrink-0",
    footerActionsEnd: "flex justify-end gap-2",
    footerActionsBetween: "flex items-center justify-between gap-2",
  },
  button: {
    primary:
      "dp-btn-primary rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60",
    secondary:
      "dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60",
    closeIcon:
      "dp-btn-secondary inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors disabled:opacity-60",
    danger:
      "dp-danger inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60",
  },
});

export function joinClasses(...classNames) {
  return classNames.filter(Boolean).join(" ");
}
