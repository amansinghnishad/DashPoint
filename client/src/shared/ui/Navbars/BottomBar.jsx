import {
  CalendarDays,
  CheckSquare,
  Clock,
  Crosshair,
  LayoutGrid,
  StickyNote,
  FileText,
  Image,
  Youtube,
} from "@/shared/ui/icons";
import { createElement, useEffect, useReducer, useRef } from "react";

const menuReducer = (state, action) => {
  switch (action.type) {
    case "OPEN":
      return { open: true, mounted: true, visible: false };
    case "SHOW":
      return { ...state, visible: true };
    case "CLOSE":
      return { ...state, open: false, visible: false };
    case "UNMOUNT":
      return { open: false, mounted: false, visible: false };
    default:
      return state;
  }
};

const MENU_CLOSED = { open: false, mounted: false, visible: false };

const PLANNER_ICON_BY_VALUE = {
  "todo-list": CheckSquare,
  appointments: CalendarDays,
  "daily-schedule": Clock,
  notes: StickyNote,
};

const TOOLS = [
  { id: "planner", label: "Planner", Icon: LayoutGrid },
  { id: "photo", label: "Photo", Icon: Image },
  { id: "youtube", label: "YouTube", Icon: Youtube },
  { id: "file", label: "File", Icon: FileText },
];

export default function BottomBar({
  activeTool,
  onSelectTool,
  plannerOptions,
  onPlannerSelect,
  onRecenterViewport,
  className = "",
  show = true,
}) {
  const [menuState, dispatchMenu] = useReducer(menuReducer, MENU_CLOSED);
  const plannerMenuOpen = menuState.open;
  const plannerMenuMounted = menuState.mounted;
  const plannerMenuVisible = menuState.visible;
  const setPlannerMenuOpen = (valueOrUpdater) => {
    const next =
      typeof valueOrUpdater === "function"
        ? valueOrUpdater(menuState.open)
        : valueOrUpdater;
    if (next) dispatchMenu({ type: "OPEN" });
    else dispatchMenu({ type: "CLOSE" });
  };
  const plannerMenuRef = useRef(null);
  const plannerMenuTimerRef = useRef(null);

  useEffect(() => {
    if (!plannerMenuOpen) return;

    const handlePointerDown = (e) => {
      const el = plannerMenuRef.current;
      if (!el) return;
      if (el.contains(e.target)) return;
      setPlannerMenuOpen(false);
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setPlannerMenuOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [plannerMenuOpen]);

  useEffect(() => {
    if (plannerMenuTimerRef.current) {
      window.clearTimeout(plannerMenuTimerRef.current);
      plannerMenuTimerRef.current = null;
    }

    if (plannerMenuOpen) {
      const raf = window.requestAnimationFrame(() => {
        dispatchMenu({ type: "SHOW" });
      });
      return () => window.cancelAnimationFrame(raf);
    }

    // Animate out, then unmount.
    plannerMenuTimerRef.current = window.setTimeout(() => {
      dispatchMenu({ type: "UNMOUNT" });
      plannerMenuTimerRef.current = null;
    }, 160);
  }, [plannerMenuOpen]);

  if (!show) return null;

  return (
    <div
      className={`absolute left-1/2 bottom-4 -translate-x-1/2 z-20 ${className}`}
    >
      <div className="dp-surface dp-border rounded-2xl border shadow-lg px-2 py-2">
        <div className="flex items-center gap-1">
          {TOOLS.map(({ id, label, Icon }) => {
            const isActive = activeTool === id;

            return (
              <div key={id} className="flex items-center">
                {id === "planner" && Array.isArray(plannerOptions) ? (
                  <div ref={plannerMenuRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setPlannerMenuOpen((v) => !v)}
                      title={label}
                      aria-label={label}
                      aria-haspopup="menu"
                      aria-expanded={plannerMenuOpen}
                      className={
                        isActive || plannerMenuOpen
                          ? "dp-btn-primary inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
                          : "dp-text-muted dp-hover-bg dp-hover-text inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
                      }
                    >
                      {createElement(Icon, { size: 18 })}
                    </button>

                    {plannerMenuMounted ? (
                      <div
                        role="menu"
                        className={
                          "fixed left-1/2 bottom-20 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-[22rem] z-50 dp-nav-panel dp-border rounded-3xl border shadow-2xl p-3 backdrop-blur-xl origin-bottom " +
                          "sm:absolute sm:bottom-full sm:left-1/2 sm:mb-3 sm:w-80 sm:-translate-x-1/2 sm:z-auto " +
                          "motion-safe:transition-all motion-safe:duration-150 motion-safe:ease-out will-change-transform will-change-opacity " +
                          (plannerMenuVisible
                            ? "opacity-100 translate-y-0 scale-100"
                            : "opacity-0 translate-y-2 scale-95")
                        }
                      >
                        <div className="grid grid-cols-3 gap-2">
                          {plannerOptions.map((opt) => {
                            const TileIcon =
                              PLANNER_ICON_BY_VALUE?.[opt.value] || LayoutGrid;

                            return (
                              <button
                                key={opt.value}
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                  setPlannerMenuOpen(false);
                                  onPlannerSelect?.(opt.value);
                                }}
                                className="dp-hover-bg rounded-2xl p-3 text-left transition-colors motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-out motion-safe:hover:scale-[1.02]"
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <div className="dp-surface-muted dp-border flex h-10 w-10 items-center justify-center rounded-2xl border">
                                    <TileIcon size={18} className="dp-text" />
                                  </div>
                                  <div className="dp-text text-center text-[11px] font-semibold leading-tight">
                                    {opt.label}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectTool?.(id)}
                    title={label}
                    aria-label={label}
                    className={
                      isActive
                        ? "dp-btn-primary inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
                        : "dp-text-muted dp-hover-bg dp-hover-text inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
                    }
                  >
                    {createElement(Icon, { size: 18 })}
                  </button>
                )}
              </div>
            );
          })}

          {typeof onRecenterViewport === "function" ? (
            <>
              <div className="mx-1 h-6 border-l dp-border" />
              <button
                type="button"
                onClick={() => onRecenterViewport()}
                title="Re-center view"
                aria-label="Re-center view"
                className="dp-text-muted dp-hover-bg dp-hover-text inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
              >
                {createElement(Crosshair, { size: 18 })}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
