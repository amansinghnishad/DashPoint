import { History, Search } from "lucide-react";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

import { IconMenu } from "@/shared/ui/icons/icons";

import Clock from "../../../shared/ui/Clock/Clock";
import InfoModal from "../../../shared/ui/modals/InfoModal";
import { SideBar } from "../../../shared/ui/Navbars/SideBar";
import FloatingInstallDownloadButtons from "../../../shared/ui/PWAStatus/FloatingInstallDownloadButtons";
import UniversalSearch from "../../../shared/ui/Search/UniversalSearch";
import ChatInterface from "../../../shared/ui/Chat/ChatInterface";
import { styleTheme } from "../../../shared/ui/theme/styleTheme";
import DashboardAccountDialog from "../components/DashboardAccountDialog";
import DashboardSettingsPanel from "../components/DashboardSettingsPanel";
import useDashboardKeyboardShortcuts, {
  DASHBOARD_SHORTCUT_GROUPS,
} from "../hooks/useDashboardKeyboardShortcuts";

const CollectionsHome = lazy(() => import("./Home/CollectionsHome"));
const CollectionView = lazy(() => import("./Collection/CollectionView"));
const YoutubePage = lazy(() => import("./youtube/YoutubePage"));
const FileManagerPage = lazy(() => import("./FileManager"));
const CalendarPage = lazy(() => import("./CalendarPage"));

function ContentFallback() {
  return (
    <div className="py-10">
      <p className="dp-text-muted text-sm">Loading...</p>
    </div>
  );
}

const SECTION_LABEL_BY_TAB = {
  focus: "Assistant",
  collections: "Home",
  calendar: "Calendar",
  youtube: "YouTube",
  files: "File Manager",
};

const DASHBOARD_UI_INITIAL_STATE = {
  activeTab: "focus",
  sidebarOpen: false,
  openCollectionId: null,
  settingsOpen: false,
  accountOpen: false,
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
    case "SET_SETTINGS_OPEN":
      return { ...state, settingsOpen: action.payload };
    case "SET_ACCOUNT_OPEN":
      return { ...state, accountOpen: action.payload };
    case "SET_SHORTCUTS_OPEN":
      return { ...state, shortcutsOpen: action.payload };
    default:
      return state;
  }
}

export default function DashboardPage() {
  const [uiState, dispatchUi] = useReducer(dashboardUiReducer, DASHBOARD_UI_INITIAL_STATE);
  const desktopSearchInputRef = useRef(null);
  const searchTriggerRef = useRef(null);
  const [youtubeSearch, setYoutubeSearch] = useState("");
  const [fileSearch, setFileSearch] = useState("");
  const [openHistoryOnAssistant, setOpenHistoryOnAssistant] = useState(false);

  const setActiveTab = useCallback((value) => {
    dispatchUi({ type: "SET_ACTIVE_TAB", payload: value });
  }, []);

  const openChatHistory = useCallback(() => {
    if (uiState.activeTab === "focus") {
      window.dispatchEvent(new Event("dashpoint:open-chat-history"));
      return;
    }

    setOpenHistoryOnAssistant(true);
    dispatchUi({ type: "SET_ACTIVE_TAB", payload: "focus" });
  }, [uiState.activeTab]);

  useEffect(() => {
    if (uiState.activeTab !== "focus" || !openHistoryOnAssistant) return undefined;
    const frameId = window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event("dashpoint:open-chat-history"));
      setOpenHistoryOnAssistant(false);
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [openHistoryOnAssistant, uiState.activeTab]);

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
      uiState.settingsOpen ||
      uiState.accountOpen ||
      uiState.shortcutsOpen,
    onNavigate: onShortcutNavigate,
    onOpenShortcuts: () => dispatchUi({ type: "SET_SHORTCUTS_OPEN", payload: true }),
    onFocusSearch: () => {
      desktopSearchInputRef.current?.focus();
    },
    onToggleSidebar: () => dispatchUi({ type: "SET_SIDEBAR_OPEN", payload: !uiState.sidebarOpen }),
  });

  const content = useMemo(() => {
    switch (uiState.activeTab) {
      case "focus":
        return null;
      case "calendar":
        return <CalendarPage />;
      case "youtube":
        return (
          <YoutubePage
            searchTriggerRef={searchTriggerRef}
          />
        );
      case "files":
        return (
          <FileManagerPage
            searchTriggerRef={searchTriggerRef}
          />
        );
      case "collections":
      default:
        return (
          <CollectionsHome
            onOpenCollection={onOpenCollection}
          />
        );
    }
      }, [onOpenCollection, uiState.activeTab, searchTriggerRef]);

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
        onAccountOpen={() => dispatchUi({ type: "SET_ACCOUNT_OPEN", payload: true })}
        onSettingsOpen={() => dispatchUi({ type: "SET_SETTINGS_OPEN", payload: true })}
        onShortcutsOpen={() => dispatchUi({ type: "SET_SHORTCUTS_OPEN", payload: true })}
      />

      <div className="flex min-h-screen flex-col lg:pl-16">
        <div className="flex w-full flex-1 flex-col">
          <header className="sticky top-0 z-40 px-4 py-3 lg:px-8 bg-transparent">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 sm:grid-cols-[minmax(120px,1fr)_minmax(220px,3fr)_auto]">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => dispatchUi({ type: "SET_SIDEBAR_OPEN", payload: true })}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-canvas-soft lg:hidden transition-colors"
                  aria-label="Open sidebar"
                >
                  <IconMenu size={16} className="text-ink" />
                </button>
                <h1 className="truncate text-sm font-semibold text-muted sm:text-base">
                  {currentSectionLabel}
                </h1>
              </div>

              <div className="order-3 col-span-2 min-w-0 sm:order-none sm:col-span-1 sm:col-start-2 sm:row-start-1">
                {uiState.activeTab === "youtube" || uiState.activeTab === "files" ? (
                  <div className="mx-auto flex h-10 w-full max-w-3xl items-center gap-2 rounded-full border border-hairline bg-surface-card/70 px-4 focus-within:ring-1 focus-within:ring-primary/20">
                    <Search size={16} className="shrink-0 text-muted" />
                    <input
                      ref={desktopSearchInputRef}
                      value={uiState.activeTab === "youtube" ? youtubeSearch : fileSearch}
                      onChange={(event) => {
                        if (uiState.activeTab === "youtube") {
                          setYoutubeSearch(event.target.value);
                        } else {
                          setFileSearch(event.target.value);
                        }
                        searchTriggerRef.current?.(event.target.value);
                      }}
                      placeholder={
                        uiState.activeTab === "youtube" ? "Search YouTube..." : "Search files..."
                      }
                      className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted-soft"
                    />
                  </div>
                ) : (
                  <UniversalSearch
                    ref={desktopSearchInputRef}
                    onResultSelect={onUniversalSearchSelect}
                    placeholder="Search your workspace..."
                  />
                )}
              </div>

              <div className="order-2 flex items-center justify-self-end gap-1 sm:order-none sm:col-start-3 sm:row-start-1 sm:gap-3">
                <Clock
                  showSeconds={false}
                  className="border-none bg-transparent p-0 text-sm font-medium tabular-nums text-muted shadow-none"
                />
                <button
                  type="button"
                  onClick={openChatHistory}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-canvas-soft hover:text-ink"
                  aria-label="Open history"
                  title="History"
                >
                  <History size={18} />
                </button>
              </div>
            </div>
          </header>

          <main
            className={
              uiState.activeTab === "focus"
                ? "flex min-h-0 flex-1 flex-col px-0 pb-0"
                : "px-4 pb-32 lg:px-6"
            }
          >
            {uiState.activeTab !== "focus" && (
              <Suspense fallback={<ContentFallback />}>{content}</Suspense>
            )}
            <div
              className={
                uiState.activeTab === "focus"
                  ? "flex min-h-0 flex-1 flex-col"
                  : "fixed bottom-4 left-1/2 z-[80] w-[calc(100%-2rem)] max-w-[720px] -translate-x-1/2"
              }
            >
              <ChatInterface
                showEmptyStateDetails={uiState.activeTab === "focus"}
                isFloating={uiState.activeTab !== "focus"}
              />
            </div>
          </main>
        </div>
      </div>

      <DashboardSettingsPanel
        open={uiState.settingsOpen}
        onClose={() => dispatchUi({ type: "SET_SETTINGS_OPEN", payload: false })}
        shortcutGroups={DASHBOARD_SHORTCUT_GROUPS}
      />

      <DashboardAccountDialog
        open={uiState.accountOpen}
        onClose={() => dispatchUi({ type: "SET_ACCOUNT_OPEN", payload: false })}
      />

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
