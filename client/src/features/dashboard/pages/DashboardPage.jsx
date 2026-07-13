import { Bell, History, Plus, Search } from "lucide-react";
import { lazy, Suspense, useCallback, useMemo, useReducer, useRef, useState } from "react";

import { IconMenu } from "@/shared/ui/icons/icons";

import { useAuth } from "../../../context/AuthContext";
import Clock from "../../../shared/ui/Clock/Clock";
import InfoModal from "../../../shared/ui/modals/InfoModal";
import { SideBar } from "../../../shared/ui/Navbars/SideBar";
import FloatingInstallDownloadButtons from "../../../shared/ui/PWAStatus/FloatingInstallDownloadButtons";
import UniversalSearch from "../../../shared/ui/Search/UniversalSearch";
import { styleTheme } from "../../../shared/ui/theme/styleTheme";
import useDashboardKeyboardShortcuts, {
  DASHBOARD_SHORTCUT_GROUPS,
} from "../hooks/useDashboardKeyboardShortcuts";

const CollectionsHome = lazy(() => import("./Home/CollectionsHome"));
const CollectionView = lazy(() => import("./Collection/CollectionView"));
const YoutubePage = lazy(() => import("./youtube/YoutubePage"));
const FileManagerPage = lazy(() => import("./FileManager"));
const CalendarPage = lazy(() => import("./CalendarPage"));
const FocusPage = lazy(() => import("./FocusPage"));
const DashboardChatBar = lazy(() => import("../../../shared/ui/Chat/DashboardChatBar"));

function ContentFallback() {
  return (
    <div className="py-10">
      <p className="dp-text-muted text-sm">Loading...</p>
    </div>
  );
}

const SECTION_LABEL_BY_TAB = {
  focus: "Focus",
  collections: "Collections",
  calendar: "Calendar",
  youtube: "YouTube",
  files: "File Manager",
};

const DASHBOARD_UI_INITIAL_STATE = {
  activeTab: "focus",
  sidebarOpen: false,
  openCollectionId: null,
  notificationsOpen: false,
  settingsOpen: false,
  shortcutsOpen: false,
};

function dashboardUiReducer(state, action) {
  switch (action.type) {
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload };
    case "SET_SIDEBAR_OPEN":
      return { ...state, sidebarOpen: action.payload };
    case "SET_OPEN_COLLECTION_ID":
      return { ...state, openCollectionId: action.payload };
    case "SET_NOTIFICATIONS_OPEN":
      return { ...state, notificationsOpen: action.payload };
    case "SET_SETTINGS_OPEN":
      return { ...state, settingsOpen: action.payload };
    case "SET_SHORTCUTS_OPEN":
      return { ...state, shortcutsOpen: action.payload };
    default:
      return state;
  }
}

export default function DashboardPage() {
  const [uiState, dispatchUi] = useReducer(dashboardUiReducer, DASHBOARD_UI_INITIAL_STATE);
  const desktopSearchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const createCollectionTriggerRef = useRef(null);
  const searchTriggerRef = useRef(null);
  const [ytSearch, setYtSearch] = useState("");

  const { user } = useAuth();
  const displayName = useMemo(() => {
    const username = String(user?.username || "").trim();
    if (username) return username;

    const explicitName = String(user?.name || "").trim();
    if (explicitName) return explicitName;

    const email = String(user?.email || "").trim();
    if (email) return email.split("@")[0];

    return "User";
  }, [user]);

  const setActiveTab = useCallback((value) => {
    dispatchUi({ type: "SET_ACTIVE_TAB", payload: value });
  }, []);

  const onOpenCollection = useCallback((value) => {
    const id =
      typeof value === "string" || typeof value === "number" ? value : value?._id || value?.id;
    if (!id) return;
    dispatchUi({ type: "SET_OPEN_COLLECTION_ID", payload: String(id) });
    dispatchUi({ type: "SET_SIDEBAR_OPEN", payload: false });
  }, []);

  const onShortcutNavigate = useCallback((value) => {
    dispatchUi({ type: "SET_OPEN_COLLECTION_ID", payload: null });
    dispatchUi({ type: "SET_ACTIVE_TAB", payload: value });
    dispatchUi({ type: "SET_SIDEBAR_OPEN", payload: false });
  }, []);

  const onUniversalSearchSelect = useCallback(
    (result) => {
      const type = result?.type;
      const metadata = result?.metadata || {};
      const collectionId = metadata.collectionId || (type === "collection" ? result.id : "");

      if (collectionId) {
        onOpenCollection(collectionId);
        return;
      }

      const tabByType = {
        file: "files",
        youtube: "youtube",
        youtube_transcript: "youtube",
        calendar_event: "calendar",
        planner_widget: "collections",
        chat_message: "focus",
      };

      const nextTab = tabByType[type];
      if (!nextTab) return;

      dispatchUi({ type: "SET_OPEN_COLLECTION_ID", payload: null });
      dispatchUi({ type: "SET_ACTIVE_TAB", payload: nextTab });
      dispatchUi({ type: "SET_SIDEBAR_OPEN", payload: false });
    },
    [onOpenCollection],
  );

  useDashboardKeyboardShortcuts({
    disabled:
      Boolean(uiState.openCollectionId) ||
      uiState.notificationsOpen ||
      uiState.settingsOpen ||
      uiState.shortcutsOpen,
    onNavigate: onShortcutNavigate,
    onOpenShortcuts: () => dispatchUi({ type: "SET_SHORTCUTS_OPEN", payload: true }),
    onFocusSearch: () => {
      const isSmallScreen =
        typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches;
      const target = isSmallScreen ? mobileSearchInputRef.current : desktopSearchInputRef.current;
      target?.focus();
    },
    onToggleSidebar: () => dispatchUi({ type: "SET_SIDEBAR_OPEN", payload: !uiState.sidebarOpen }),
  });

  const content = useMemo(() => {
    switch (uiState.activeTab) {
      case "focus":
        return <FocusPage />;
      case "calendar":
        return <CalendarPage />;
      case "youtube":
        return <YoutubePage triggerRef={createCollectionTriggerRef} searchTriggerRef={searchTriggerRef} />;
      case "files":
        return <FileManagerPage triggerRef={createCollectionTriggerRef} searchTriggerRef={searchTriggerRef} />;
      case "collections":
      default:
        return <CollectionsHome onOpenCollection={onOpenCollection} triggerRef={createCollectionTriggerRef} />;
    }
  }, [onOpenCollection, uiState.activeTab, createCollectionTriggerRef, searchTriggerRef]);

  const currentSectionLabel = SECTION_LABEL_BY_TAB[uiState.activeTab] || "";

  if (uiState.openCollectionId) {
    return (
      <Suspense fallback={<ContentFallback />}>
        <CollectionView
          collectionId={uiState.openCollectionId}
          onBack={() => dispatchUi({ type: "SET_OPEN_COLLECTION_ID", payload: null })}
        />
      </Suspense>
    );
  }

  return (
    <div className={styleTheme.layout.appPage}>
      <SideBar
        activeTab={uiState.activeTab}
        setActiveTab={setActiveTab}
        isOpen={uiState.sidebarOpen}
        onClose={() => dispatchUi({ type: "SET_SIDEBAR_OPEN", payload: false })}
        onNotificationsOpen={() => dispatchUi({ type: "SET_NOTIFICATIONS_OPEN", payload: true })}
        onSettingsOpen={() => dispatchUi({ type: "SET_SETTINGS_OPEN", payload: true })}
        onShortcutsOpen={() => dispatchUi({ type: "SET_SHORTCUTS_OPEN", payload: true })}
      />

      <div className="lg:pl-16">
        <div className="w-full max-w-6xl mx-auto">
          <header className="py-6 px-4 lg:px-8 border-b border-hairline/40 bg-canvas/80 backdrop-blur-md sticky top-0 z-40">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => dispatchUi({ type: "SET_SIDEBAR_OPEN", payload: true })}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-white hover:bg-canvas-soft lg:hidden transition-colors"
                  aria-label="Open sidebar"
                >
                  <IconMenu size={16} className="text-ink" />
                </button>
                <div className="min-w-0">
                  <p className="text-xs text-muted-soft font-semibold uppercase tracking-[0.06em]">Dashboard</p>
                  <h1 className="text-xl font-bold text-ink tracking-tight mt-0.5">{currentSectionLabel}</h1>
                </div>
              </div>

              <div className="flex min-w-0 items-center gap-4">
                {(uiState.activeTab === "collections" || uiState.activeTab === "youtube" || uiState.activeTab === "files") ? (
                  <>
                    <div className="hidden sm:block">
                      {uiState.activeTab === "collections" ? (
                        <UniversalSearch
                          ref={desktopSearchInputRef}
                          onResultSelect={onUniversalSearchSelect}
                          placeholder="Search collections, files, or tasks..."
                        />
                      ) : (
                        <div className="bg-canvas-soft border border-hairline flex h-9 items-center gap-2 rounded-full px-3 w-[240px] focus-within:bg-white focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-200">
                          <Search size={15} className="text-muted shrink-0" />
                          <input
                            value={ytSearch}
                            onChange={(e) => {
                              setYtSearch(e.target.value);
                              searchTriggerRef.current?.(e.target.value);
                            }}
                            placeholder={uiState.activeTab === "youtube" ? "Search YouTube..." : "Search files..."}
                            className="min-w-0 flex-1 bg-transparent text-[13px] outline-none text-ink placeholder:text-muted-soft"
                          />
                        </div>
                      )}
                    </div>

                    {/* Clock time and Action button matching the screenshot */}
                    <div className="flex items-center gap-4">
                      <Clock showSeconds={true} className="border-none bg-transparent shadow-none p-0 text-sm font-medium tabular-nums text-muted-soft hidden md:block" />
                      <button
                        type="button"
                        onClick={() => createCollectionTriggerRef.current?.()}
                        className="bg-primary hover:bg-primary-active text-canvas rounded-full px-5 py-2 text-[13px] font-semibold transition-all h-9 flex items-center justify-center gap-1.5 shadow-sm shrink-0"
                      >
                        <Plus size={15} />
                        <span>
                          {uiState.activeTab === "collections"
                            ? "Create Collection"
                            : uiState.activeTab === "youtube"
                              ? "Add Video"
                              : "Add Document"}
                        </span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="hidden sm:block">
                      <UniversalSearch
                        ref={desktopSearchInputRef}
                        onResultSelect={onUniversalSearchSelect}
                      />
                    </div>

                    {/* Header Action Icons matching the screenshot */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => dispatchUi({ type: "SET_NOTIFICATIONS_OPEN", payload: true })}
                        className="h-9 w-9 flex items-center justify-center rounded-full text-muted hover:text-ink hover:bg-canvas-soft transition-colors relative"
                        aria-label="Notifications"
                      >
                        <Bell size={18} />
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                      </button>

                      <button
                        type="button"
                        className="h-9 w-9 flex items-center justify-center rounded-full text-muted hover:text-ink hover:bg-canvas-soft transition-colors"
                        aria-label="History"
                      >
                        <History size={18} />
                      </button>

                      <div className="h-8 w-px bg-hairline mx-1" />

                      {/* Profile Picture */}
                      <div className="relative group cursor-pointer">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80"
                          alt={displayName}
                          className="w-8 h-8 rounded-full border border-hairline object-cover"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-green-500" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="mt-3 sm:hidden">
              <UniversalSearch
                ref={mobileSearchInputRef}
                onResultSelect={onUniversalSearchSelect}
              />
            </div>
          </header>

          <main className="px-4 pb-32 lg:px-6">
            <Suspense fallback={<ContentFallback />}>{content}</Suspense>
          </main>
        </div>
      </div>

      {uiState.activeTab !== "focus" ? (
        <Suspense fallback={null}>
          <DashboardChatBar />
        </Suspense>
      ) : null}

      <InfoModal
        open={uiState.notificationsOpen}
        onClose={() => dispatchUi({ type: "SET_NOTIFICATIONS_OPEN", payload: false })}
        title="Notifications"
        description="This panel is not wired up yet."
      >
        Notifications UI will be added here.
      </InfoModal>

      <InfoModal
        open={uiState.settingsOpen}
        onClose={() => dispatchUi({ type: "SET_SETTINGS_OPEN", payload: false })}
        title="Settings"
        description="Workspace preferences and quick controls."
      >
        <div className="space-y-4">
          <div className="border border-hairline bg-surface-card rounded-2xl p-4">
            <p className="text-ink text-sm font-semibold">Current section</p>
            <p className="text-muted mt-1 text-sm">{currentSectionLabel}</p>
          </div>
          <div className="border border-hairline bg-surface-card rounded-2xl p-4">
            <p className="text-ink text-sm font-semibold">Fast navigation</p>
            <p className="text-muted mt-1 text-sm">
              Press <kbd className="border border-hairline rounded-md px-1.5 py-0.5 bg-canvas-soft">?</kbd> any time on
              the dashboard to review app shortcuts.
            </p>
          </div>
          <div className="border border-hairline bg-surface-card rounded-2xl p-4">
            <p className="text-ink text-sm font-semibold">Theme</p>
            <p className="text-muted mt-1 text-sm">
              Use the sidebar sun or moon control to switch between light and dark mode.
            </p>
          </div>
        </div>
      </InfoModal>

      <InfoModal
        open={uiState.shortcutsOpen}
        onClose={() => dispatchUi({ type: "SET_SHORTCUTS_OPEN", payload: false })}
        title="Keyboard shortcuts"
        description="Move around DashPoint without leaving the keyboard."
        size="lg"
      >
        <div className="grid gap-5 md:grid-cols-2">
          {DASHBOARD_SHORTCUT_GROUPS.map((group) => (
            <section key={group.title}>
              <p className="text-ink mb-2 text-sm font-semibold">{group.title}</p>
              <div className="divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline bg-surface-card">
                {group.items.map((item) => (
                  <div
                    key={`${group.title}-${item.description}`}
                    className="flex items-center justify-between gap-4 px-4 py-3"
                  >
                    <span className="text-muted text-sm">{item.description}</span>
                    <span className="flex shrink-0 items-center gap-1">
                      {item.keys.map((key) => (
                        <kbd
                          key={`${item.description}-${key}`}
                          className="bg-canvas-soft border border-hairline min-w-7 rounded-md px-2 py-1 text-center text-xs font-semibold text-ink"
                        >
                          {key}
                        </kbd>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </InfoModal>

      <FloatingInstallDownloadButtons />
    </div>
  );
}
