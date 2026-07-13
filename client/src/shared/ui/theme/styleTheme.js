export const styleTheme = Object.freeze({
  layout: {
    appPage: "min-h-screen bg-canvas text-ink",
  },
  text: {
    mutedSmall: "text-muted text-sm",
  },
  modal: {
    overlay: "fixed inset-0 z-[80] bg-ink/50 backdrop-blur-sm overflow-y-auto",
    shell: "mx-auto flex min-h-full items-start justify-center p-4 sm:items-center",
    dialog:
      "bg-surface-card border border-hairline w-full rounded-xl p-6 shadow-2xl flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden",
    headerRow: "flex items-start justify-between gap-3 shrink-0",
    body: "mt-6 overflow-y-auto",
    footer: "mt-6 shrink-0",
    footerActionsEnd: "flex justify-end gap-2",
    footerActionsBetween: "flex items-center justify-between gap-2",
  },
  button: {
    primary:
      "bg-primary hover:bg-primary-active text-on-primary rounded-full px-5 py-2 text-[15px] font-medium transition-colors disabled:opacity-60 h-10 flex items-center justify-center",
    secondary:
      "bg-transparent hover:bg-hairline-soft border border-ink text-ink rounded-full px-5 py-2 text-[15px] font-medium transition-colors disabled:opacity-60 h-10 flex items-center justify-center",
    closeIcon:
      "bg-transparent hover:bg-hairline-soft border border-hairline text-ink inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors disabled:opacity-60",
    danger:
      "bg-semantic-error hover:opacity-90 text-white inline-flex items-center justify-center rounded-full px-5 py-2 text-[15px] font-medium transition-colors disabled:opacity-60 h-10 flex items-center justify-center",
  },
});

export function joinClasses(...classNames) {
  return classNames.filter(Boolean).join(" ");
}
