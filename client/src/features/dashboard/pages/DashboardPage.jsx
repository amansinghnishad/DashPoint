import { lazy, Suspense, useCallback, useMemo, useReducer, useRef } from "react";

import { IconMenu } from "@/shared/ui/icons/icons";

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
        return <FocusPage onNavigate={onShortcutNavigate} onOpenCollection={onOpenCollection} />;
      case "calendar":
        return <CalendarPage />;
      case "youtube":
        return <YoutubePage />;
      case "files":
        return <FileManagerPage />;
      case "collections":
      default:
        return <CollectionsHome onOpenCollection={onOpenCollection} />;
    }
  }, [onOpenCollection, onShortcutNavigate, uiState.activeTab]);

  const currentSectionLabel =
    uiState.activeTab === "focus"
      ? "Focus"
      : uiState.activeTab === "collections"
      ? "Collections"
      : uiState.activeTab === "calendar"
        ? "Calendar"
        : uiState.activeTab === "youtube"
          ? "YouTube"
          : uiState.activeTab === "files"
            ? "File Manager"
            : "";

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
          <header className="p-4 lg:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => dispatchUi({ type: "SET_SIDEBAR_OPEN", payload: true })}
                  className="dp-btn-secondary inline-flex h-10 w-10 items-center justify-center rounded-xl lg:hidden"
                  aria-label="Open sidebar"
                >
                  <IconMenu size={18} />
                </button>
                <div className="min-w-0">
                  <p className="dp-text text-lg font-semibold truncate">Dashboard</p>
                  <p className="dp-text-muted text-sm truncate">{currentSectionLabel}</p>
                </div>
              </div>

              <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
                <div className="hidden min-w-0 flex-1 justify-end sm:flex">
                  <UniversalSearch
                    ref={desktopSearchInputRef}
                    onResultSelect={onUniversalSearchSelect}
                  />
                </div>
                <Clock />
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

      <Suspense fallback={null}>
        <DashboardChatBar />
      </Suspense>

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
          <div className="dp-surface dp-border rounded-2xl border p-4">
            <p className="dp-text text-sm font-semibold">Current section</p>
            <p className="dp-text-muted mt-1 text-sm">{currentSectionLabel}</p>
          </div>
          <div className="dp-surface dp-border rounded-2xl border p-4">
            <p className="dp-text text-sm font-semibold">Fast navigation</p>
            <p className="dp-text-muted mt-1 text-sm">
              Press <kbd className="dp-border rounded-md border px-1.5 py-0.5">?</kbd> any time on
              the dashboard to review app shortcuts.
            </p>
          </div>
          <div className="dp-surface dp-border rounded-2xl border p-4">
            <p className="dp-text text-sm font-semibold">Theme</p>
            <p className="dp-text-muted mt-1 text-sm">
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
              <p className="dp-text mb-2 text-sm font-semibold">{group.title}</p>
              <div className="divide-y dp-border overflow-hidden rounded-2xl border">
                {group.items.map((item) => (
                  <div
                    key={`${group.title}-${item.description}`}
                    className="flex items-center justify-between gap-4 px-4 py-3"
                  >
                    <span className="dp-text-muted text-sm">{item.description}</span>
                    <span className="flex shrink-0 items-center gap-1">
                      {item.keys.map((key) => (
                        <kbd
                          key={`${item.description}-${key}`}
                          className="dp-surface dp-border min-w-7 rounded-md border px-2 py-1 text-center text-xs font-semibold dp-text"
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
