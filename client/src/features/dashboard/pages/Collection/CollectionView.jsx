import { useCallback, useMemo, useRef } from "react";

import { ArrowLeft, FolderOpen } from "@/shared/ui/icons/icons";

import CollectionPickerModal from "./components/CollectionPickerModal";
import DocumentSummaryModal from "./components/DocumentSummaryModal";
import { isPdfFile } from "./components/documentSummaryUtils";
import ResizableItemCard from "./components/ResizableItemCard";
import useCollectionData from "./hooks/useCollectionData";
import useCollectionLayouts from "./hooks/useCollectionLayouts";
import useCollectionViewActions from "./hooks/useCollectionViewActions";
import useCollectionViewport from "./hooks/useCollectionViewport";
import { PLANNER_WIDGET_MENU_OPTIONS } from "./utils/plannerWidgetDefaults";
import { useToast } from "../../../../hooks/useToast";
import { collectionsAPI } from "../../../../services/modules/collectionsApi";
import Clock from "../../../../shared/ui/Clock/Clock";
import DeleteConfirmModal from "../../../../shared/ui/modals/DeleteConfirmModal";
import BottomBar from "../../../../shared/ui/Navbars/BottomBar";

const getItemKey = (it) => {
  if (!it) return "";
  if (it.itemType && it.itemId) return `${it.itemType}:${it.itemId}`;
  if (it._id) return String(it._id);
  if (it.itemId) return String(it.itemId);
  return "";
};

export default function CollectionView({ collectionId, onBack }) {
  const toast = useToast();
  const { collection, items, loading, reload } = useCollectionData({
    collectionId,
    onError: toast.error,
  });

  const canvasSurfaceRef = useRef(null);
  const worldRef = useRef(null);

  const persistCollectionLayouts = useCallback(
    async (layoutsPayload) => {
      if (!collectionId) return;
      try {
        await collectionsAPI.updateCollection(collectionId, {
          layouts: layoutsPayload,
        });
      } catch {
        // Keep UI responsive; localStorage still preserves layout.
      }
    },
    [collectionId],
  );

  const { layoutsByItemKey, setLayoutsByItemKey } = useCollectionLayouts({
    collectionId,
    items,
    canvasRef: canvasSurfaceRef,
    getItemKey,
    initialLayouts: collection?.layouts,
    persistLayouts: persistCollectionLayouts,
  });

  const { viewportScale, viewportOffset, recenterViewport } = useCollectionViewport({
    canvasRef: canvasSurfaceRef,
    worldRef,
    layoutsByItemKey,
  });

  const {
    activeTool,
    creatingPlanner,
    pickerState,
    isSummarizingDocument,
    documentSummaryOpen,
    deleteState,
    setPickerState,
    setDeleteState,
    setDocumentSummaryOpen,
    createPlannerAndAdd,
    confirmRemove,
    handleSelectTool,
    summarizeUploadedPdf,
  } = useCollectionViewActions({
    collectionId,
    reload,
    getItemKey,
    setLayoutsByItemKey,
    isPdfFile,
    toast,
  });

  const title = useMemo(() => {
    return collection?.name ? String(collection.name) : "Collection";
  }, [collection?.name]);

  const existingKeys = useMemo(() => {
    return new Set(items.map(getItemKey).filter((k) => typeof k === "string" && k.length));
  }, [items]);

  if (!collectionId) return null;

  return (
    <div className="fixed inset-0 z-[70] dp-bg dp-text">
      <div className="h-full flex flex-col">
        <div className="shrink-0 dp-surface dp-border border-b px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={onBack}
                className="dp-btn-secondary inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors"
                aria-label="Back"
              >
                <ArrowLeft size={18} />
                Back
              </button>

              <div className="min-w-0">
                <p className="dp-text font-semibold truncate">{title}</p>
                <p className="dp-text-muted text-sm">
                  {loading ? "Loading..." : `${items.length} item${items.length === 1 ? "" : "s"}`}
                </p>
              </div>
            </div>

            <Clock />
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div
            ref={canvasSurfaceRef}
            className="relative dp-surface w-full h-full overflow-hidden touch-none"
          >
            <BottomBar
              activeTool={activeTool}
              onSelectTool={handleSelectTool}
              plannerOptions={PLANNER_WIDGET_MENU_OPTIONS}
              onPlannerSelect={(type) => {
                if (creatingPlanner) return;
                createPlannerAndAdd(type);
              }}
              onRecenterViewport={recenterViewport}
            />

            <CollectionPickerModal
              open={pickerState.open}
              tool={pickerState.tool}
              onClose={() => setPickerState((prev) => ({ ...prev, open: false }))}
              collectionId={collectionId}
              existingKeys={existingKeys}
              onAdded={reload}
            />

            <DocumentSummaryModal
              open={documentSummaryOpen}
              busy={isSummarizingDocument}
              onClose={() => {
                if (isSummarizingDocument) return;
                setDocumentSummaryOpen(false);
              }}
              onSubmit={summarizeUploadedPdf}
            />

            <div
              ref={worldRef}
              className="absolute inset-0 origin-top-left"
              style={{
                transform: `translate(${viewportOffset.x}px, ${viewportOffset.y}px) scale(${viewportScale})`,
              }}
            >
              {!loading && items.length > 0
                ? items
                    .map((it) => ({ key: getItemKey(it), item: it }))
                    .filter((x) => x.key)
                    .map(({ key, item }) => (
                      <ResizableItemCard
                        key={key}
                        item={item}
                        containerRef={canvasSurfaceRef}
                        viewportScale={viewportScale}
                        layout={layoutsByItemKey[key]}
                        onLayoutChange={(nextLayout) =>
                          setLayoutsByItemKey((prev) => ({
                            ...prev,
                            [key]: nextLayout,
                          }))
                        }
                        onDelete={() => setDeleteState((prev) => ({ ...prev, item }))}
                      />
                    ))
                : null}
            </div>

            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="dp-surface dp-border rounded-2xl border px-4 py-3">
                  <p className="dp-text-soft text-sm font-medium">Loading collection...</p>
                </div>
              </div>
            ) : items.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-6">
                  <FolderOpen size={40} className="mx-auto dp-text-muted" />
                  <p className="mt-4 dp-text font-semibold">Empty canvas</p>
                  <p className="mt-1 dp-text-muted text-sm">
                    Select a tool from the bottom bar to add items.
                  </p>
                </div>
              </div>
            ) : null}

            <DeleteConfirmModal
              open={Boolean(deleteState.item)}
              onClose={() => {
                if (deleteState.isRemoving) return;
                setDeleteState((prev) => ({ ...prev, item: null }));
              }}
              onConfirm={confirmRemove}
              title="Remove item"
              description="Remove this item from the collection?"
              busy={deleteState.isRemoving}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
