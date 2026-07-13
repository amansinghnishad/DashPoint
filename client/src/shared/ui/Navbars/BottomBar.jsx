import { createElement, useCallback, useEffect, useReducer, useRef } from "react";
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
} from "lucide-react";

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
  { id: "photo", label: "Photo", Icon: Image, shortcut: "5" },
  { id: "youtube", label: "YouTube", Icon: Youtube, shortcut: "6" },
  { id: "file", label: "File", Icon: FileText, shortcut: "7" },
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
  const setPlannerMenuOpen = useCallback(
    (valueOrUpdater) => {
      const next =
        typeof valueOrUpdater === "function" ? valueOrUpdater(plannerMenuOpen) : valueOrUpdater;
      if (next) dispatchMenu({ type: "OPEN" });
      else dispatchMenu({ type: "CLOSE" });
    },
    [plannerMenuOpen],
  );
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
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      setPlannerMenuOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [plannerMenuOpen, setPlannerMenuOpen]);

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
    <div className={`absolute left-1/2 bottom-4 -translate-x-1/2 z-20 ${className}`}>
      <div className="bg-surface-card border border-hairline rounded-2xl shadow-lg px-2 py-2">
        <div className="flex items-center gap-1">
          {TOOLS.map(({ id, label, Icon, shortcut }) => {
            const isActive = activeTool === id;
            const title = shortcut ? `${label} (${shortcut})` : `${label} (1-4)`;

            return (
              <div key={id} className="flex items-center">
                {id === "planner" && Array.isArray(plannerOptions) ? (
                  <div ref={plannerMenuRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setPlannerMenuOpen((v) => !v)}
                      title={title}
                      aria-label={label}
                      aria-haspopup="menu"
                      aria-expanded={plannerMenuOpen}
                      className={
                        isActive || plannerMenuOpen
                          ? "bg-ink text-canvas inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors cursor-pointer"
                          : "text-muted hover:text-ink hover:bg-canvas-soft inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors cursor-pointer"
                      }
                    >
                      {createElement(Icon, { size: 18 })}
                    </button>

                    {plannerMenuMounted ? (
                      <div
                        role="menu"
                        className={
                          "fixed left-1/2 bottom-20 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-[22rem] z-50 bg-surface-card border border-hairline rounded-3xl shadow-2xl p-3 backdrop-blur-xl origin-bottom " +
                          "sm:absolute sm:bottom-full sm:left-1/2 sm:mb-3 sm:w-80 sm:-translate-x-1/2 sm:z-auto " +
                          "motion-safe:transition-all motion-safe:duration-150 motion-safe:ease-out will-change-transform will-change-opacity " +
                          (plannerMenuVisible
                            ? "opacity-100 translate-y-0 scale-100"
                            : "opacity-0 translate-y-2 scale-95")
                        }
                      >
                        <div className="grid grid-cols-3 gap-2">
                          {plannerOptions.map((opt, index) => {
                            const TileIcon = PLANNER_ICON_BY_VALUE?.[opt.value] || LayoutGrid;

                            return (
                              <button
                                key={opt.value}
                                type="button"
                                role="menuitem"
                                title={`${opt.label} (${index + 1})`}
                                onClick={() => {
                                  setPlannerMenuOpen(false);
                                  onPlannerSelect?.(opt.value);
                                }}
                                className="hover:bg-canvas-soft/50 rounded-2xl p-3 text-left transition-colors motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-out motion-safe:hover:scale-[1.02] cursor-pointer"
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <div className="bg-canvas-soft border border-hairline flex h-10 w-10 items-center justify-center rounded-2xl">
                                    <TileIcon size={18} className="text-ink" />
                                  </div>
                                  <div className="text-ink text-center text-[11px] font-semibold leading-tight">
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
                    title={title}
                    aria-label={label}
                    className={
                      isActive
                        ? "bg-ink text-canvas inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors cursor-pointer"
                        : "text-muted hover:text-ink hover:bg-canvas-soft inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors cursor-pointer"
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
              <div className="mx-1 h-6 border-l border-hairline" />
              <button
                type="button"
                onClick={() => onRecenterViewport()}
                title="Re-center view (0)"
                aria-label="Re-center view"
                className="text-muted hover:text-ink hover:bg-canvas-soft inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors cursor-pointer"
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
