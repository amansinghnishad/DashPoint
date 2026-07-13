import { useEffect, useMemo } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useToast } from "../../../hooks/useToast";

const TOAST_THEMES = {
  success: {
    borderLeft: "border-l-emerald-500 dark:border-l-emerald-400",
    icon: CheckCircle2,
    iconColor: "text-emerald-500 dark:text-emerald-400",
  },
  error: {
    borderLeft: "border-l-red-500 dark:border-l-red-400",
    icon: XCircle,
    iconColor: "text-red-500 dark:text-red-400",
  },
  warning: {
    borderLeft: "border-l-amber-500 dark:border-l-amber-400",
    icon: AlertTriangle,
    iconColor: "text-amber-500 dark:text-amber-400",
  },
  info: {
    borderLeft: "border-l-primary dark:border-l-primary-active",
    icon: Info,
    iconColor: "text-primary dark:text-primary-active",
  },
};

export default function Toaster() {
  const { toasts, removeToast } = useToast();

  useEffect(() => {
    if (!toasts.length) return;

    const timers = toasts.map((t) =>
      window.setTimeout(() => removeToast(t.id), t.duration ?? 4000)
    );

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [toasts, removeToast]);

  const items = useMemo(() => {
    return toasts.map((t) => {
      const theme = TOAST_THEMES[t.type] ?? TOAST_THEMES.info;
      const Icon = theme.icon;

      return (
        <div
          key={t.id}
          role="status"
          className={`bg-surface-card border border-hairline ${theme.borderLeft} border-l-[3.5px] pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.08)] animate-fade-in w-[320px]`}
        >
          <div className={`mt-0.5 shrink-0 ${theme.iconColor}`}>
            <Icon size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold leading-relaxed text-ink">{t.message}</p>
          </div>
          <button
            type="button"
            onClick={() => removeToast(t.id)}
            className="text-muted hover:text-ink hover:bg-canvas-soft rounded-lg p-1 transition-colors shrink-0"
            aria-label="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>
      );
    });
  }, [toasts, removeToast]);

  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex max-w-[calc(100vw-2rem)] flex-col gap-2 select-none">
      {items}
    </div>
  );
}
