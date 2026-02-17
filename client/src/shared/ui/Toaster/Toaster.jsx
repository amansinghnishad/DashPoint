import { useEffect, useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle,
  IconClose,
  Info,
  XCircle,
} from "@/shared/ui/icons";
import { useToast } from "../../../hooks/useToast";

const ICONS_BY_TYPE = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const TYPE_CLASS_BY_TYPE = {
  success: "dp-toast-success",
  error: "dp-toast-error",
  warning: "dp-toast-warning",
  info: "dp-toast-info",
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
      const Icon = ICONS_BY_TYPE[t.type] ?? Info;
      const typeClass = TYPE_CLASS_BY_TYPE[t.type] ?? TYPE_CLASS_BY_TYPE.info;

      return (
        <div
          key={t.id}
          role="status"
          className={`dp-surface dp-border dp-text ${typeClass} pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-sm`}
        >
          <div className="mt-0.5">
            <Icon size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-5">{t.message}</p>
          </div>
          <button
            type="button"
            onClick={() => removeToast(t.id)}
            className="dp-text-muted dp-hover-text dp-hover-bg inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            aria-label="Dismiss notification"
          >
            <IconClose size={16} />
          </button>
        </div>
      );
    });
  }, [toasts, removeToast]);

  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex max-w-[calc(100vw-2rem)] flex-col gap-2">
      {items}
    </div>
  );
}
