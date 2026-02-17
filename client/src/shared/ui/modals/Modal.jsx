import { useEffect, useId, useMemo, useRef } from "react";
import { IconClose } from "@/shared/ui/icons";
import { joinClasses, styleTheme } from "../theme/styleTheme";

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

  if (!open) return null;

  return (
    <div
      className={styleTheme.modal.overlay}
      role="presentation"
      onMouseDown={(e) => {
        if (!closeOnOverlayClick) return;
        if (!canClose) return;
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className={joinClasses(styleTheme.modal.shell, maxWidthClass)}
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
          className={styleTheme.modal.dialog}
        >
          <div className={styleTheme.modal.headerRow}>
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
              className={styleTheme.button.closeIcon}
              aria-label={closeLabel}
            >
              <IconClose size={18} />
            </button>
          </div>

          <div className={styleTheme.modal.body}>{children}</div>

          {footer ? <div className={styleTheme.modal.footer}>{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
