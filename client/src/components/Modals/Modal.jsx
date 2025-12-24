import { useEffect, useId, useMemo, useRef } from "react";
import { X } from "lucide-react";

const getFocusableElements = (root) => {
  if (!root) return [];
  const selectors = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");

  return Array.from(root.querySelectorAll(selectors)).filter((el) => {
    const isHidden = el.getAttribute("aria-hidden") === "true";
    const isDisabled = el.hasAttribute("disabled");
    const isVisible = !!(
      el.offsetWidth ||
      el.offsetHeight ||
      el.getClientRects().length
    );
    return !isHidden && !isDisabled && isVisible;
  });
};

export default function Modal({
  open,
  title,
  description,
  children,
  footer,
  onClose,
  closeLabel = "Close",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  disableClose = false,
  size = "md",
}) {
  if (!open) return null;

  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);
  const previouslyFocusedRef = useRef(null);
  const previousBodyOverflowRef = useRef(null);

  const maxWidthClass = useMemo(() => {
    if (size === "sm") return "max-w-md";
    if (size === "lg") return "max-w-3xl";
    return "max-w-xl";
  }, [size]);

  const canClose = !disableClose;
  const hasTitle = Boolean(title);
  const hasDescription = Boolean(description);

  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current = document.activeElement;

    previousBodyOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTarget = () => {
      const dialogEl = dialogRef.current;
      if (!dialogEl) return;

      const focusables = getFocusableElements(dialogEl);
      if (focusables.length) {
        focusables[0].focus();
      } else {
        dialogEl.focus();
      }
    };

    const raf = requestAnimationFrame(focusTarget);

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = previousBodyOverflowRef.current ?? "";

      const prev = previouslyFocusedRef.current;
      if (prev && typeof prev.focus === "function") {
        // Restore focus to the element that opened the modal.
        prev.focus();
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (!open) return;

      if (e.key === "Escape") {
        if (closeOnEscape && canClose) onClose?.();
        return;
      }

      if (e.key !== "Tab") return;
      const dialogEl = dialogRef.current;
      if (!dialogEl) return;

      const focusables = getFocusableElements(dialogEl);
      if (!focusables.length) {
        e.preventDefault();
        dialogEl.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || active === dialogEl) {
          e.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [canClose, closeOnEscape, onClose, open]);

  return (
    <div
      className="fixed inset-0 z-[80] dp-overlay backdrop-blur-sm overflow-y-auto"
      role="presentation"
      onMouseDown={(e) => {
        if (!closeOnOverlayClick) return;
        if (!canClose) return;
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className={`mx-auto flex min-h-full ${maxWidthClass} items-start justify-center p-4 sm:items-center`}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={
            !hasTitle && typeof title === "string"
              ? title
              : !hasTitle
              ? "Dialog"
              : undefined
          }
          aria-labelledby={hasTitle ? titleId : undefined}
          aria-describedby={hasDescription ? descriptionId : undefined}
          tabIndex={-1}
          className="dp-sidebar-surface dp-border w-full rounded-3xl border p-6 shadow-2xl flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden"
        >
          <div className="flex items-start justify-between gap-3 shrink-0">
            <div className="min-w-0">
              {title ? (
                <p id={titleId} className="dp-text text-lg font-semibold">
                  {title}
                </p>
              ) : null}
              {description ? (
                <p id={descriptionId} className="dp-text-muted mt-1 text-sm">
                  {description}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => {
                if (!canClose) return;
                onClose?.();
              }}
              disabled={!canClose}
              className="dp-btn-secondary inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors disabled:opacity-60"
              aria-label={closeLabel}
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-6 overflow-y-auto">{children}</div>

          {footer ? <div className="mt-6 shrink-0">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
