import { useCallback, useMemo, useState } from "react";
import { Menu } from "lucide-react";

import { SideBar } from "../../components/Navbars/SideBar";
import Modal from "../../components/Modals/Modal";

import WidgetsLayout from "../../layouts/Dashboard/Widgets.layout";
import FloatingInstallDownloadButtons from "../../components/PWAStatus/FloatingInstallDownloadButtons";

import CollectionsHome from "./Home/CollectionsHome";
import CollectionView from "./Collection/CollectionView";
import YoutubePage from "./Youtube";
import AIExplainerPage from "./AI-Explainer";
import FileManagerPage from "./FileManager";

export default function Dashboard() {
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
      case "youtube":
        return <YoutubePage />;
      case "content":
        return <AIExplainerPage />;
      case "files":
        return <FileManagerPage />;
      case "collections":
      default:
        return <CollectionsHome onOpenCollection={onOpenCollection} />;
    }
  }, [activeTab, onOpenCollection]);

  if (openCollectionId) {
    return (
      <CollectionView
        collectionId={openCollectionId}
        onBack={() => setOpenCollectionId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen dp-bg dp-text">
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
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="dp-btn-secondary inline-flex h-10 w-10 items-center justify-center rounded-xl lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu size={18} />
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
                    : activeTab === "content"
                    ? "Content Extractor"
                    : activeTab === "files"
                    ? "File Manager"
                    : ""}
                </p>
              </div>
            </div>
          </header>

          <main className="px-4 pb-10 lg:px-6">{content}</main>
        </div>
      </div>

      <Modal
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        title="Notifications"
        description="This panel is not wired up yet."
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setNotificationsOpen(false)}
              className="dp-btn-primary rounded-xl px-4 py-2 text-sm font-semibold"
            >
              Close
            </button>
          </div>
        }
      >
        <div className="dp-text-muted text-sm">
          Notifications UI will be added here.
        </div>
      </Modal>

      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Settings"
        description="This panel is not wired up yet."
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              className="dp-btn-primary rounded-xl px-4 py-2 text-sm font-semibold"
            >
              Close
            </button>
          </div>
        }
      >
        <div className="dp-text-muted text-sm">Settings UI will go here.</div>
      </Modal>

      <Modal
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
        title="Keyboard shortcuts"
        description="This panel is not wired up yet."
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShortcutsOpen(false)}
              className="dp-btn-primary rounded-xl px-4 py-2 text-sm font-semibold"
            >
              Close
            </button>
          </div>
        }
      >
        <div className="dp-text-muted text-sm">
          Shortcut help will be added here.
        </div>
      </Modal>

      <WidgetsLayout open={widgetsOpen} onClose={() => setWidgetsOpen(false)} />

      <FloatingInstallDownloadButtons />
    </div>
  );
}
