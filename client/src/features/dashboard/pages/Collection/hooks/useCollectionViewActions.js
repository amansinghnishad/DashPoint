import { useCallback, useState } from "react";

import { collectionsAPI } from "../../../../../services/modules/collectionsApi";
import { plannerWidgetsAPI } from "../../../../../services/modules/plannerWidgetsApi";
import { getDefaultPlannerWidgetData, getPlannerWidgetLabel } from "../utils/plannerWidgetDefaults";

export default function useCollectionViewActions({
  collectionId,
  reload,
  getItemKey,
  setLayoutsByItemKey,
  isPdfFile,
  toast,
}) {
  const [activeTool, setActiveTool] = useState("youtube");
  const [pickerState, setPickerState] = useState({ open: false, tool: null });
  const [isSummarizingDocument, setIsSummarizingDocument] = useState(false);
  const [documentSummaryOpen, setDocumentSummaryOpen] = useState(false);
  const [creatingPlanner, setCreatingPlanner] = useState(false);
  const [deleteState, setDeleteState] = useState({
    item: null,
    isRemoving: false,
  });

  const openPicker = useCallback((toolId) => {
    setPickerState({ open: true, tool: toolId });
  }, []);

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
          throw new Error(createRes?.message || "Failed to create planner widget");
        }

        const created = createRes.data;
        if (!created?._id) throw new Error("Create succeeded but missing id");

        const addRes = await collectionsAPI.addItemToCollection(
          collectionId,
          "planner",
          String(created._id),
        );
        if (!addRes?.success) {
          throw new Error(addRes?.message || "Failed to add item to collection");
        }

        toast.success("Planner widget added.");
        await reload();
      } catch (err) {
        const message =
          err?.response?.data?.message || err?.message || "Failed to create planner widget";
        toast.error(message);
      } finally {
        setCreatingPlanner(false);
      }
    },
    [collectionId, reload, toast],
  );

  const confirmRemove = useCallback(async () => {
    const itemType = deleteState.item?.itemType;
    const itemId = deleteState.item?.itemId;
    if (!itemType || !itemId) return;

    try {
      setDeleteState((prev) => ({ ...prev, isRemoving: true }));
      const res = await collectionsAPI.removeItemFromCollection(collectionId, itemType, itemId);
      if (!res?.success) {
        throw new Error(res?.message || "Failed to remove item");
      }

      const key = getItemKey(deleteState.item);
      if (key) {
        setLayoutsByItemKey((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }

      toast.success("Removed from collection.");
      setDeleteState({ item: null, isRemoving: false });
      await reload();
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to remove item";
      toast.error(message);
    } finally {
      setDeleteState((prev) => ({ ...prev, isRemoving: false }));
    }
  }, [collectionId, deleteState.item, getItemKey, reload, setLayoutsByItemKey, toast]);

  const handleSelectTool = useCallback(
    (toolId) => {
      setActiveTool(toolId);
      if (toolId === "planner") return;
      if (toolId === "file" || toolId === "document") {
        setDocumentSummaryOpen(true);
        return;
      }
      openPicker(toolId);
    },
    [openPicker],
  );

  const summarizeUploadedPdf = useCallback(
    async (file) => {
      if (!file) return;

      if (!isPdfFile(file)) {
        toast.warning("Please upload a PDF file.");
        return;
      }

      try {
        setIsSummarizingDocument(true);
        const response = await collectionsAPI.summarizeDocument(collectionId, file);
        if (!response?.success) {
          throw new Error(response?.message || "Failed to summarize document");
        }

        const title = response?.data?.widget?.title || String(file?.name || "document").trim();
        toast.success(`Summary note saved: ${title}`);
        setDocumentSummaryOpen(false);
        setActiveTool("planner");
        await reload();
      } catch (error) {
        const message =
          error?.response?.data?.message || error?.message || "Failed to summarize document";
        toast.error(message);
      } finally {
        setIsSummarizingDocument(false);
      }
    },
    [collectionId, isPdfFile, reload, toast],
  );

  return {
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
  };
}
