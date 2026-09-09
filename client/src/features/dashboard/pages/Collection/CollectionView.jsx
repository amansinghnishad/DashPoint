import { Download, FolderOpen } from "lucide-react";
import { useCallback, useMemo, useRef } from "react";

import { ArrowLeft } from "@/shared/ui/icons/icons";

import CollectionPickerModal from "./components/CollectionPickerModal";
import DocumentSummaryModal from "./components/DocumentSummaryModal";
import { isPdfFile } from "./components/documentSummaryUtils";
import ExportImportModal from "./components/ExportImportModal";
import ResizableItemCard from "./components/ResizableItemCard";
import VoiceNoteModal from "./components/VoiceNoteModal";
import useCollectionData from "./hooks/useCollectionData";
import useCollectionHistory from "./hooks/useCollectionHistory";
import useCollectionKeyboardShortcuts from "./hooks/useCollectionKeyboardShortcuts";
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

  const {
    recordSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useCollectionHistory(layoutsByItemKey);

  const handleUndo = useCallback(() => {
    const previousLayouts = undo();
    if (previousLayouts) {
      setLayoutsByItemKey(previousLayouts);
      toast.info("Undo layout change");
    }
  }, [setLayoutsByItemKey, toast, undo]);

  const handleRedo = useCallback(() => {
    const nextLayouts = redo();
    if (nextLayouts) {
      setLayoutsByItemKey(nextLayouts);
      toast.info("Redo layout change");
    }
  }, [redo, setLayoutsByItemKey, toast]);

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
    voiceNoteOpen,
    exportImportOpen,
    deleteState,
    setPickerState,
    setDeleteState,
    setDocumentSummaryOpen,
    setVoiceNoteOpen,
    setExportImportOpen,
    createPlannerAndAdd,
    saveVoiceAsNote,
    saveVoiceAsTodoList,
    importDataToCollection,
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

  const closePicker = useCallback(() => {
    setPickerState((prev) => ({ ...prev, open: false }));
  }, [setPickerState]);

  const closeDocumentSummary = useCallback(() => {
    if (isSummarizingDocument) return;
    setDocumentSummaryOpen(false);
  }, [isSummarizingDocument, setDocumentSummaryOpen]);

  const closeVoiceNote = useCallback(() => {
    setVoiceNoteOpen(false);
  }, [setVoiceNoteOpen]);

  const closeExportImport = useCallback(() => {
    setExportImportOpen(false);
  }, [setExportImportOpen]);

  const closeDeleteConfirm = useCallback(() => {
    if (deleteState.isRemoving) return;
    setDeleteState((prev) => ({ ...prev, item: null }));
  }, [deleteState.isRemoving, setDeleteState]);

  useCollectionKeyboardShortcuts({
    creatingPlanner,
    deleteBusy: deleteState.isRemoving,
    deleteOpen: Boolean(deleteState.item),
    documentSummaryBusy: isSummarizingDocument,
    documentSummaryOpen,
    voiceNoteOpen,
    exportImportOpen,
    pickerOpen: pickerState.open,
    onBack,
    onCloseDelete: closeDeleteConfirm,
    onCloseDocumentSummary: closeDocumentSummary,
    onCloseVoiceNote: closeVoiceNote,
    onCloseExportImport: closeExportImport,
    onClosePicker: closePicker,
    onCreatePlanner: createPlannerAndAdd,
    onRecenterViewport: recenterViewport,
    onSelectTool: handleSelectTool,
    onUndo: handleUndo,
    onRedo: handleRedo,
  });

  if (!collectionId) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-canvas text-ink font-sans">
      <div className="h-full flex flex-col">
        <div className="shrink-0 bg-surface-card border-b border-hairline px-4 py-3.5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={onBack}
                className="bg-transparent hover:bg-hairline-soft border border-hairline text-ink inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all h-9 cursor-pointer"
                aria-label="Back"
              >
                <ArrowLeft size={18} />
                Back
              </button>

              <div className="min-w-0">
                <p className="font-waldenburg-light text-lg font-bold text-ink leading-tight truncate">
                  {title}
                </p>
                <p className="text-muted text-xs font-semibold mt-0.5">
                  {loading ? "Loading..." : `${items.length} item${items.length === 1 ? "" : "s"}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setExportImportOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface-card hover:bg-canvas-soft px-4 py-2 text-xs font-semibold text-ink transition-colors shadow-sm cursor-pointer"
                title="Export or Import collection data"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Export / Import</span>
              </button>

              <div className="hidden md:block">
                <Clock />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div
            ref={canvasSurfaceRef}
            className="relative bg-canvas w-full h-full overflow-hidden touch-none"
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
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={handleUndo}
              onRedo={handleRedo}
            />

            <CollectionPickerModal
              open={pickerState.open}
              tool={pickerState.tool}
              onClose={closePicker}
              collectionId={collectionId}
              existingKeys={existingKeys}
              onAdded={reload}
            />

            <DocumentSummaryModal
              open={documentSummaryOpen}
              busy={isSummarizingDocument}
              onClose={closeDocumentSummary}
              onSubmit={summarizeUploadedPdf}
            />

            <VoiceNoteModal
              open={voiceNoteOpen}
              onClose={closeVoiceNote}
              onSaveAsNote={saveVoiceAsNote}
              onSaveAsTodoList={saveVoiceAsTodoList}
            />

            <ExportImportModal
              open={exportImportOpen}
              onClose={closeExportImport}
              collection={collection}
              items={items}
              layouts={layoutsByItemKey}
              onImportData={importDataToCollection}
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
<<<<<<< HEAD
                  .map((it) => ({ key: getItemKey(it), item: it }))
                  .filter((x) => x.key)
                  .map(({ key, item }) => (
                    <ResizableItemCard
                      key={key}
                      item={item}
                      containerRef={canvasSurfaceRef}
                      viewportScale={viewportScale}
                      layout={layoutsByItemKey[key]}
                      onLayoutChange={(nextLayout) => {
                        setLayoutsByItemKey((prev) => {
                          const nextMap = {
                            ...prev,
                            [key]: nextLayout,
                          };
                          recordSnapshot(nextMap);
                          return nextMap;
                        });
                      }}
                      onDelete={() => setDeleteState((prev) => ({ ...prev, item }))}
                    />
                  ))
=======
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
>>>>>>> cf88124a26c6d999d7cc19fe6ca10b9a2e307dfd
                : null}
            </div>

            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-surface-card border border-hairline rounded-2xl px-6 py-4 shadow-md">
                  <p className="text-ink text-sm font-semibold">Loading collection...</p>
                </div>
              </div>
            ) : items.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center select-none">
                <div className="text-center px-6">
                  <FolderOpen size={40} className="mx-auto text-muted-soft" />
                  <p className="mt-4 text-ink font-bold text-base">Empty canvas</p>
                  <p className="mt-1 text-muted text-sm">
                    Select a tool from the bottom bar to add items.
                  </p>
                </div>
              </div>
            ) : null}

            <DeleteConfirmModal
              open={Boolean(deleteState.item)}
              onClose={closeDeleteConfirm}
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
