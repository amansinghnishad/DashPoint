import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  ArrowLeft,
  FolderOpen,
  Youtube,
  StickyNote,
  CheckSquare,
  Image,
  FileText,
} from "lucide-react";
import { collectionsAPI } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import {
  AddFileToCollectionModal,
  AddItemModal,
  AddYouTubeToCollectionModal,
  ItemDetailsModal,
  ResizableItemCard,
} from "./index";

export const CollectionView = ({ collectionId, onBack }) => {
  const [collection, setCollection] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addInitialType, setAddInitialType] = useState("youtube");
  const [showAddFileModal, setShowAddFileModal] = useState(false);
  const [addFileMode, setAddFileMode] = useState("file");
  const [showAddYouTubeModal, setShowAddYouTubeModal] = useState(false);
  const [activeTool, setActiveTool] = useState("youtube");
  const [selectedItem, setSelectedItem] = useState(null);
  const { success, error } = useToast();

  const canvasSurfaceRef = useRef(null);

  const layoutStorageKey = useMemo(() => {
    if (!collectionId) return null;
    return `dashpoint:collection-layout:${collectionId}`;
  }, [collectionId]);

  const [layoutsByItemId, setLayoutsByItemId] = useState({});
  const latestLayoutsRef = useRef({});

  const getItemKey = useCallback((it) => {
    if (!it) return "";
    // Always prefer the logical identity (stable across fetches)
    if (it.itemType && it.itemId) return `${it.itemType}:${it.itemId}`;
    // Fallbacks
    if (it._id) return String(it._id);
    if (it.itemId) return String(it.itemId);
    return "";
  }, []);

  const getCanvasRect = useCallback(() => {
    const el = canvasSurfaceRef.current;
    if (!el) return null;
    return el.getBoundingClientRect();
  }, []);

  // Keep a live reference for flush-on-exit saves
  useEffect(() => {
    latestLayoutsRef.current = layoutsByItemId;
  }, [layoutsByItemId]);

  const loadCollection = useCallback(async () => {
    try {
      setLoading(true);
      const response = await collectionsAPI.getCollectionWithItems(
        collectionId
      );

      if (response.success) {
        setCollection(response.data);
        setItems(response.data.items || []);
      } else {
        console.error("Failed to load collection:", response);
        error("Failed to load collection");
      }
    } catch (err) {
      console.error("Error loading collection:", err);
      error("Failed to load collection");
    } finally {
      setLoading(false);
    }
  }, [collectionId, error]);

  useEffect(() => {
    if (collectionId) loadCollection();
  }, [collectionId, loadCollection]);

  const handleDeleteItem = async (item) => {
    if (!window.confirm("Remove this item from the collection?")) return;

    try {
      const response = await collectionsAPI.removeItemFromCollection(
        collectionId,
        item.itemType,
        item.itemId
      );

      if (response.success) {
        success("Item removed from collection");
        loadCollection();
      } else {
        throw new Error(response.message || "Failed to remove item");
      }
    } catch (err) {
      console.error("Error removing item:", err);
      error(err.message || "Failed to remove item");
    }
  };

  const handleViewItem = (item) => {
    setSelectedItem(item);
  };

  const handleCloseDetails = () => {
    setSelectedItem(null);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const handleItemAdded = () => {
    loadCollection();
  };

  const openAddTool = useCallback(
    (tool) => {
      setActiveTool(tool);

      if (tool === "youtube") {
        setShowAddYouTubeModal(true);
        return;
      }

      if (tool === "photo" || tool === "file") {
        setAddFileMode(tool);
        setShowAddFileModal(true);
        return;
      }

      const typeMap = {
        youtube: "youtube",
        note: "sticky-note",
        todo: "todo",
      };

      setAddInitialType(typeMap[tool] || "youtube");
      setShowAddModal(true);
    },
    [setActiveTool]
  );

  // Load saved layout when collection changes
  useEffect(() => {
    if (!layoutStorageKey) return;
    try {
      const raw = window.localStorage.getItem(layoutStorageKey);
      const parsed = raw ? JSON.parse(raw) : {};
      setLayoutsByItemId(parsed && typeof parsed === "object" ? parsed : {});
    } catch {
      setLayoutsByItemId({});
    }
  }, [layoutStorageKey]);

  // Ensure every item has a layout; remove stale entries
  useEffect(() => {
    setLayoutsByItemId((prev) => {
      const next = { ...prev };
      const existingIds = new Set(
        items.map(getItemKey).filter((k) => typeof k === "string" && k.length)
      );

      Object.keys(next).forEach((key) => {
        if (!existingIds.has(key)) delete next[key];
      });

      const cardW = 320;
      const cardH = 240;
      const gap = 16;

      const rect = getCanvasRect();
      const canvasW = rect?.width ?? 1200;
      const canvasH = rect?.height ?? 700;
      const cols = Math.max(1, Math.floor((canvasW - gap) / (cardW + gap)));

      items.forEach((it, index) => {
        const itemKey = getItemKey(it);
        if (!itemKey) return;
        if (next[itemKey]) return;

        const col = index % cols;
        const row = Math.floor(index / cols);
        let x = col * (cardW + gap) + gap;
        let y = row * (cardH + gap) + gap;

        if (x + cardW > canvasW - gap) x = gap;
        if (y + cardH > canvasH - gap) {
          x = gap;
          y = gap;
        }

        next[itemKey] = { x, y, width: cardW, height: cardH };
      });

      return next;
    });
  }, [items, getCanvasRect, getItemKey]);

  // Persist layout (debounced)
  useEffect(() => {
    if (!layoutStorageKey) return;
    const t = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          layoutStorageKey,
          JSON.stringify(layoutsByItemId)
        );
      } catch {
        // ignore
      }
    }, 200);

    return () => window.clearTimeout(t);
  }, [layoutStorageKey, layoutsByItemId]);

  // Flush layouts immediately when leaving (back/refresh/tab close)
  useEffect(() => {
    if (!layoutStorageKey) return;

    const flush = () => {
      try {
        window.localStorage.setItem(
          layoutStorageKey,
          JSON.stringify(latestLayoutsRef.current || {})
        );
      } catch {
        // ignore
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };

    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      flush();
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [layoutStorageKey]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] bg-gray-50">
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="fixed inset-0 z-[60] bg-gray-50">
        <div className="h-full flex items-center justify-center">
          <div className="text-center px-6">
            <FolderOpen size={40} className="mx-auto text-gray-300" />
            <h3 className="mt-4 text-base font-semibold text-gray-900">
              Collection not found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              It may have been deleted.
            </p>
            <button
              onClick={onBack}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft size={18} />
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-gray-50">
      <div className="h-full flex flex-col">
        <div className="shrink-0 bg-white border-b border-gray-200 px-4 py-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <div
            ref={canvasSurfaceRef}
            className="relative bg-white w-full h-full"
          >
            {/* Bottom toolbar */}
            <div className="absolute left-1/2 bottom-4 -translate-x-1/2 z-20">
              <div className="flex items-center gap-1 rounded-2xl bg-gray-900/90 backdrop-blur-md border border-white/10 shadow-lg px-2 py-2">
                <button
                  type="button"
                  onClick={() => openAddTool("note")}
                  title="Note"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    activeTool === "note"
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <StickyNote size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => openAddTool("todo")}
                  title="Todo"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    activeTool === "todo"
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <CheckSquare size={18} />
                </button>

                <div className="w-px h-6 bg-white/10 mx-1" />

                <button
                  type="button"
                  onClick={() => openAddTool("photo")}
                  title="Photo"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    activeTool === "photo"
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Image size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => openAddTool("youtube")}
                  title="YouTube"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    activeTool === "youtube"
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Youtube size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => openAddTool("file")}
                  title="File"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    activeTool === "file"
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <FileText size={18} />
                </button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-6">
                  <FolderOpen size={40} className="mx-auto text-gray-300" />
                  <h3 className="mt-4 text-base font-semibold text-gray-900">
                    Empty canvas
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Add a widget and place it anywhere.
                  </p>
                </div>
              </div>
            ) : (
              items.map((item) => (
                <ResizableItemCard
                  key={getItemKey(item)}
                  item={item}
                  onDelete={handleDeleteItem}
                  onView={handleViewItem}
                  containerRef={canvasSurfaceRef}
                  layout={layoutsByItemId[getItemKey(item)]}
                  onLayoutChange={(nextLayout) =>
                    setLayoutsByItemId((prev) => ({
                      ...prev,
                      [getItemKey(item)]: nextLayout,
                    }))
                  }
                />
              ))
            )}
          </div>
        </div>

        <AddItemModal
          isOpen={showAddModal}
          onClose={handleCloseAddModal}
          collectionId={collectionId}
          onItemAdded={handleItemAdded}
          initialItemType={addInitialType}
        />

        <AddFileToCollectionModal
          isOpen={showAddFileModal}
          onClose={() => setShowAddFileModal(false)}
          collectionId={collectionId}
          onItemAdded={handleItemAdded}
          mode={addFileMode}
        />

        <AddYouTubeToCollectionModal
          isOpen={showAddYouTubeModal}
          onClose={() => setShowAddYouTubeModal(false)}
          collectionId={collectionId}
          onItemAdded={handleItemAdded}
        />
        <ItemDetailsModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={handleCloseDetails}
        />
      </div>
    </div>
  );
};
