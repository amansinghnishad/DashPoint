import { lazy, Suspense, useCallback, useMemo, useReducer } from "react";
import { IconMenu } from "@/shared/ui/icons";

import { SideBar } from "../../../shared/ui/Navbars/SideBar";
import Clock from "../../../shared/ui/Clock/Clock";
import FloatingInstallDownloadButtons from "../../../shared/ui/PWAStatus/FloatingInstallDownloadButtons";
import InfoModal from "../../../shared/ui/modals/InfoModal";
import { styleTheme } from "../../../shared/ui/theme/styleTheme";

const CollectionsHome = lazy(() => import("./Home/CollectionsHome"));
const CollectionView = lazy(() => import("./Collection/CollectionView"));
const YoutubePage = lazy(() => import("./youtube/YoutubePage"));
const FileManagerPage = lazy(() => import("./FileManager"));
const CalendarPage = lazy(() => import("./CalendarPage"));
const DashboardChatBar = lazy(
  () => import("../../../shared/ui/Chat/DashboardChatBar"),
);

function ContentFallback() {
  return (
    <div className="py-10">
      <p className="dp-text-muted text-sm">Loading...</p>
    </div>
  );
}

const DASHBOARD_UI_INITIAL_STATE = {
  activeTab: "collections",
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
  const [uiState, dispatchUi] = useReducer(
    dashboardUiReducer,
    DASHBOARD_UI_INITIAL_STATE,
  );

  const onOpenCollection = useCallback((value) => {
    const id =
      typeof value === "string" || typeof value === "number"
        ? value
        : value?._id || value?.id;
    if (!id) return;
    dispatchUi({ type: "SET_OPEN_COLLECTION_ID", payload: String(id) });
    dispatchUi({ type: "SET_SIDEBAR_OPEN", payload: false });
  }, []);

  const content = useMemo(() => {
    switch (uiState.activeTab) {
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
  }, [onOpenCollection, uiState.activeTab]);

  if (uiState.openCollectionId) {
    return (
      <Suspense fallback={<ContentFallback />}>
        <CollectionView
          collectionId={uiState.openCollectionId}
          onBack={() =>
            dispatchUi({ type: "SET_OPEN_COLLECTION_ID", payload: null })
          }
        />
      </Suspense>
    );
  }

  return (
    <div className={styleTheme.layout.appPage}>
      <SideBar
        activeTab={uiState.activeTab}
        setActiveTab={(value) =>
          dispatchUi({ type: "SET_ACTIVE_TAB", payload: value })
        }
        isOpen={uiState.sidebarOpen}
        onClose={() => dispatchUi({ type: "SET_SIDEBAR_OPEN", payload: false })}
        onNotificationsOpen={() =>
          dispatchUi({ type: "SET_NOTIFICATIONS_OPEN", payload: true })
        }
        onSettingsOpen={() =>
          dispatchUi({ type: "SET_SETTINGS_OPEN", payload: true })
        }
        onShortcutsOpen={() =>
          dispatchUi({ type: "SET_SHORTCUTS_OPEN", payload: true })
        }
      />

      <div className="lg:pl-16">
        <div className="w-full max-w-6xl mx-auto">
          <header className="p-4 lg:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() =>
                    dispatchUi({ type: "SET_SIDEBAR_OPEN", payload: true })
                  }
                  className="dp-btn-secondary inline-flex h-10 w-10 items-center justify-center rounded-xl lg:hidden"
                  aria-label="Open sidebar"
                >
                  <IconMenu size={18} />
                </button>
                <div className="min-w-0">
                  <p className="dp-text text-lg font-semibold truncate">
                    Dashboard
                  </p>
                  <p className="dp-text-muted text-sm truncate">
                    {uiState.activeTab === "collections"
                      ? "Collections"
                      : uiState.activeTab === "calendar"
                        ? "Calendar"
                        : uiState.activeTab === "youtube"
                          ? "YouTube"
                          : uiState.activeTab === "files"
                            ? "File Manager"
                            : ""}
                  </p>
                </div>
              </div>

              <Clock />
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
        onClose={() =>
          dispatchUi({ type: "SET_NOTIFICATIONS_OPEN", payload: false })
        }
        title="Notifications"
        description="This panel is not wired up yet."
      >
        Notifications UI will be added here.
      </InfoModal>

      <InfoModal
        open={uiState.settingsOpen}
        onClose={() =>
          dispatchUi({ type: "SET_SETTINGS_OPEN", payload: false })
        }
        title="Settings"
        description="This panel is not wired up yet."
      >
        Settings UI will go here.
      </InfoModal>

      <InfoModal
        open={uiState.shortcutsOpen}
        onClose={() =>
          dispatchUi({ type: "SET_SHORTCUTS_OPEN", payload: false })
        }
        title="Keyboard shortcuts"
        description="This panel is not wired up yet."
      >
        Shortcut help will be added here.
      </InfoModal>

      <FloatingInstallDownloadButtons />
    </div>
  );
}
