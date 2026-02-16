import { useCallback, useMemo, useRef, useState } from "react";
import { ArrowLeft, FolderOpen } from "@/shared/ui/icons";
import { collectionsAPI } from "../../../../services/modules/collectionsApi";
import { plannerWidgetsAPI } from "../../../../services/modules/plannerWidgetsApi";
import { useToast } from "../../../../hooks/useToast";
import BottomBar from "../../../../shared/ui/Navbars/BottomBar";
import Clock from "../../../../shared/ui/Clock/Clock";
import ResizableItemCard from "./components/ResizableItemCard";
import DeleteConfirmModal from "../../../../shared/ui/modals/DeleteConfirmModal";
import CollectionPickerModal from "./components/CollectionPickerModal";
import useCollectionLayouts from "./hooks/useCollectionLayouts";
import useCollectionData from "./hooks/useCollectionData";
import useCollectionViewport from "./hooks/useCollectionViewport";
import {
  getDefaultPlannerWidgetData,
  getPlannerWidgetLabel,
  PLANNER_WIDGET_MENU_OPTIONS,
} from "./utils/plannerWidgetDefaults";

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
    toast,
  });
  const [activeTool, setActiveTool] = useState("youtube");

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTool, setPickerTool] = useState(null);

  const [deleteCanvasItem, setDeleteCanvasItem] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);

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
    [collectionId]
  );

  const { layoutsByItemKey, setLayoutsByItemKey } = useCollectionLayouts({
    collectionId,
    items,
    canvasRef: canvasSurfaceRef,
    getItemKey,
    initialLayouts: collection?.layouts,
    persistLayouts: persistCollectionLayouts,
  });

  const { viewportScale, viewportOffset, recenterViewport } =
    useCollectionViewport({
      canvasRef: canvasSurfaceRef,
      worldRef,
      layoutsByItemKey,
    });

  const title = useMemo(() => {
    return collection?.name ? String(collection.name) : "Collection";
  }, [collection?.name]);

  const existingKeys = useMemo(() => {
    return new Set(
      items.map(getItemKey).filter((k) => typeof k === "string" && k.length)
    );
  }, [items]);

  const openPicker = useCallback((toolId) => {
    setPickerTool(toolId);
    setPickerOpen(true);
  }, []);

  const [creatingPlanner, setCreatingPlanner] = useState(false);

  const createPlannerAndAdd = useCallback(
    async (widgetType) => {
      const type = String(widgetType || "").trim();
      if (!type) return;

      try {
        setCreatingPlanner(true);
        setActiveTool("planner");

        const createRes = await plannerWidgetsAPI.create({
          widgetType: type,
          title: getPlannerWidgetLabel(type),
          data: getDefaultPlannerWidgetData(type),
        });
        if (!createRes?.success) {
          throw new Error(
            createRes?.message || "Failed to create planner widget"
          );
        }

        const created = createRes.data;
        if (!created?._id) throw new Error("Create succeeded but missing id");

        const addRes = await collectionsAPI.addItemToCollection(
          collectionId,
          "planner",
          String(created._id)
        );
        if (!addRes?.success) {
          throw new Error(
            addRes?.message || "Failed to add item to collection"
          );
        }

        toast.success("Planner widget added.");
        await reload();
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to create planner widget";
        toast.error(message);
      } finally {
        setCreatingPlanner(false);
      }
    },
    [collectionId, reload, toast]
  );

  const confirmRemove = useCallback(async () => {
    const itemType = deleteCanvasItem?.itemType;
    const itemId = deleteCanvasItem?.itemId;
    if (!itemType || !itemId) return;

    try {
      setIsRemoving(true);
      const res = await collectionsAPI.removeItemFromCollection(
        collectionId,
        itemType,
        itemId
      );
      if (!res?.success) {
        throw new Error(res?.message || "Failed to remove item");
      }

      const key = getItemKey(deleteCanvasItem);
      if (key) {
        setLayoutsByItemKey((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }

      toast.success("Removed from collection.");
      setDeleteCanvasItem(null);
      await reload();
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to remove item";
      toast.error(message);
    } finally {
      setIsRemoving(false);
    }
  }, [collectionId, deleteCanvasItem, reload, setLayoutsByItemKey, toast]);

  const handleSelectTool = useCallback(
    (toolId) => {
      setActiveTool(toolId);
      if (toolId === "planner") return;
      openPicker(toolId);
    },
    [openPicker]
  );

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
                  {loading
                    ? "Loading..."
                    : `${items.length} item${items.length === 1 ? "" : "s"}`}
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
              open={pickerOpen}
              tool={pickerTool}
              onClose={() => setPickerOpen(false)}
              collectionId={collectionId}
              existingKeys={existingKeys}
              onAdded={reload}
            />

            {/* World layer (Figma-like): items are positioned in world space and the layer is transformed. */}
            <div
              ref={worldRef}
              className="absolute inset-0 origin-top-left"
              style={{
                transform: `translate(${viewportOffset.x}px, ${viewportOffset.y}px) scale(${viewportScale})`,
                willChange: "transform",
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
                        onDelete={() => setDeleteCanvasItem(item)}
                      />
                    ))
                : null}
            </div>

            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="dp-surface dp-border rounded-2xl border px-4 py-3">
                  <p className="dp-text-soft text-sm font-medium">
                    Loading collection...
                  </p>
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
              open={Boolean(deleteCanvasItem)}
              onClose={() => {
                if (isRemoving) return;
                setDeleteCanvasItem(null);
              }}
              onConfirm={confirmRemove}
              title="Remove item"
              description="Remove this item from the collection?"
              busy={isRemoving}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

