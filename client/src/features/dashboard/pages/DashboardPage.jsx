import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { IconMenu } from "@/shared/ui/icons";

import { SideBar } from "../../../shared/ui/Navbars/SideBar";
import Clock from "../../../shared/ui/Clock/Clock";
import FloatingInstallDownloadButtons from "../../../shared/ui/PWAStatus/FloatingInstallDownloadButtons";
import InfoModal from "../../../shared/ui/modals/InfoModal";
import { styleTheme } from "../../../shared/ui/theme/styleTheme";

const WidgetsLayout = lazy(() => import("../layouts/WidgetsLayout"));
const CollectionsHome = lazy(() => import("./Home/CollectionsHome"));
const CollectionView = lazy(() => import("./Collection/CollectionView"));
const YoutubePage = lazy(() => import("./Youtube"));
const FileManagerPage = lazy(() => import("./FileManager"));
const CalendarPage = lazy(() => import("./Calendar"));
const AIServicesBottomSearchBar = lazy(
  () => import("../../../shared/ui/AI/AIServicesBottomSearchBar")
);

function ContentFallback() {
  return (
    <div className="py-10">
      <p className="dp-text-muted text-sm">Loading...</p>
    </div>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("collections");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openCollectionId, setOpenCollectionId] = useState(null);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [widgetsOpen, setWidgetsOpen] = useState(false);

  const onOpenCollection = useCallback((value) => {
    const id =
      typeof value === "string" || typeof value === "number"
        ? value
        : value?._id || value?.id;
    if (!id) return;
    setOpenCollectionId(String(id));
    setSidebarOpen(false);
  }, []);

  const content = useMemo(() => {
    switch (activeTab) {
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
  }, [activeTab, onOpenCollection]);

  if (openCollectionId) {
    return (
      <Suspense fallback={<ContentFallback />}>
        <CollectionView
          collectionId={openCollectionId}
          onBack={() => setOpenCollectionId(null)}
        />
      </Suspense>
    );
  }

  return (
    <div className={styleTheme.layout.appPage}>
      <SideBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNotificationsOpen={() => setNotificationsOpen(true)}
        onSettingsOpen={() => setSettingsOpen(true)}
        onShortcutsOpen={() => setShortcutsOpen(true)}
        onWidgetsOpen={() => setWidgetsOpen(true)}
      />

      <div className="lg:pl-16">
        <div className="w-full max-w-6xl mx-auto">
          <header className="p-4 lg:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
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
                    {activeTab === "collections"
                      ? "Collections"
                      : activeTab === "youtube"
                      ? "YouTube"
                      : activeTab === "files"
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
        <AIServicesBottomSearchBar
          onCommand={(cmd) => {
            if (cmd === "schedule" || cmd === "meeting") {
              setActiveTab("calendar");
              return;
            }
            if (cmd === "todo" || cmd === "notes") {
              setActiveTab("collections");
            }
          }}
        />
      </Suspense>

      <InfoModal
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        title="Notifications"
        description="This panel is not wired up yet."
      >
        Notifications UI will be added here.
      </InfoModal>

      <InfoModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Settings"
        description="This panel is not wired up yet."
      >
        Settings UI will go here.
      </InfoModal>

      <InfoModal
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
        title="Keyboard shortcuts"
        description="This panel is not wired up yet."
      >
        Shortcut help will be added here.
      </InfoModal>

      <Suspense fallback={null}>
        <WidgetsLayout open={widgetsOpen} onClose={() => setWidgetsOpen(false)} />
      </Suspense>

      <FloatingInstallDownloadButtons />
    </div>
  );
}

