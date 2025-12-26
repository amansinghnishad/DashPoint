import {
  Calendar,
  CalendarDays,
  CheckSquare,
  Clock,
  DollarSign,
  Droplet,
  LayoutGrid,
  ListTodo,
  Mail,
  Phone,
  Smile,
  Star,
  StickyNote,
  Target,
  Utensils,
  Wallet,
  FileText,
  Image,
  Youtube,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export default function BottomBar({
  activeTool,
  onSelectTool,
  plannerOptions,
  onPlannerSelect,
  className = "",
  show = true,
}) {
  const [plannerMenuOpen, setPlannerMenuOpen] = useState(false);
  const [plannerMenuMounted, setPlannerMenuMounted] = useState(false);
  const [plannerMenuVisible, setPlannerMenuVisible] = useState(false);
  const plannerMenuRef = useRef(null);
  const plannerMenuTimerRef = useRef(null);

  const plannerIconByValue = useMemo(
    () => ({
      "top-priorities": Star,
      "todo-list": CheckSquare,
      appointments: CalendarDays,
      "daily-schedule": Clock,
      goals: Target,
      "meal-planner": Utensils,
      "water-tracker": Droplet,
      "calls-emails": Phone,
      "expense-tracker": DollarSign,
      "notes-tomorrow": StickyNote,
      "rate-your-day": Smile,
    }),
    []
  );

  const tools = useMemo(
    () => [
      { id: "planner", label: "Planner", Icon: LayoutGrid },
      { id: "photo", label: "Photo", Icon: Image },
      { id: "youtube", label: "YouTube", Icon: Youtube },
      { id: "file", label: "File", Icon: FileText },
    ],
    []
  );

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
      setPlannerMenuMounted(true);
      const raf = window.requestAnimationFrame(() => {
        setPlannerMenuVisible(true);
      });
      return () => window.cancelAnimationFrame(raf);
    }

    // Animate out, then unmount.
    setPlannerMenuVisible(false);
    plannerMenuTimerRef.current = window.setTimeout(() => {
      setPlannerMenuMounted(false);
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
          {tools.map(({ id, label, Icon }, index) => {
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
                      <Icon size={18} />
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
                              plannerIconByValue?.[opt.value] || LayoutGrid;

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
                    <Icon size={18} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
