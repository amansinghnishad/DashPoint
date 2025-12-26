import { useEffect, useMemo, useRef, useState } from "react";

import Modal from "../../../../components/Modals/Modal";
import { useToast } from "../../../../hooks/useToast";

import CollectionPickerCreate from "./CollectionPickerCreate";
import CollectionPickerExisting from "./CollectionPickerExisting";
import { useCollectionPickerItems } from "../hooks/useCollectionPickerItems";
import { useCollectionPickerActions } from "../hooks/useCollectionPickerActions";

export default function CollectionPickerModal({
  open,
  tool,
  onClose,
  collectionId,
  existingKeys,
  onAdded,
}) {
  const toast = useToast();

  const [mode, setMode] = useState("existing");
  const isCreateMode = mode === "create";

  const [busy, setBusy] = useState(false);

  const [createYouTubeUrl, setCreateYouTubeUrl] = useState("");
  const [createPlannerWidgetType, setCreatePlannerWidgetType] =
    useState("top-priorities");
  const [createPlannerWidgetTitle, setCreatePlannerWidgetTitle] = useState("");

  const { loading, search, setSearch, selectedId, setSelectedId, filtered } =
    useCollectionPickerItems({ open, tool, toast });

  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);

  const { submitExisting, uploadAndAddFiles, createAndAdd } =
    useCollectionPickerActions({
      tool,
      collectionId,
      existingKeys,
      onClose,
      onAdded,
      toast,
      selectedId,
      setBusy,
      fileInputRef,
      photoInputRef,
      createYouTubeUrl,
      createPlannerWidgetType,
      createPlannerWidgetTitle,
    });

  const title = useMemo(() => {
    switch (tool) {
      case "planner":
        return "Add planner";
      case "youtube":
        return "Add YouTube";
      case "photo":
        return "Add photo";
      case "file":
        return "Add file";
      default:
        return "Add item";
    }
  }, [tool]);

  const description = useMemo(() => {
    switch (tool) {
      case "planner":
        return "Create a planner widget and add it to your canvas.";
      case "youtube":
        return "Pick from your saved videos.";
      case "photo":
        return "Pick from your uploaded images.";
      case "file":
        return "Pick from your uploaded files.";
      default:
        return "Pick an item to add.";
    }
  }, [tool]);

  useEffect(() => {
    if (!open) return;
    setMode(tool === "planner" ? "create" : "existing");
    setCreateYouTubeUrl("");
    setCreatePlannerWidgetType("top-priorities");
    setCreatePlannerWidgetTitle("");
    setSearch("");
    setSelectedId(null);
  }, [open, setSearch, setSelectedId, tool]);

  const primaryDisabled = busy || (!isCreateMode && !selectedId);

  return (
    <Modal
      open={open}
      onClose={() => {
        if (busy) return;
        onClose?.();
      }}
      title={title}
      description={description}
      footer={
        <div className="flex items-center justify-between gap-2">
          {isCreateMode ? (
            <button
              type="button"
              onClick={() => setMode("existing")}
              className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
              disabled={busy}
            >
              Back to existing
            </button>
          ) : (
            <span />
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setMode((m) => (m === "create" ? "existing" : "create"))
              }
              className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
              disabled={busy}
            >
              {isCreateMode ? "Pick existing" : "Create new"}
            </button>

            <button
              type="button"
              onClick={() => onClose?.()}
              className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
              disabled={busy}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={isCreateMode ? createAndAdd : submitExisting}
              className="dp-btn-primary rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
              disabled={primaryDisabled}
            >
              {busy
                ? "Working…"
                : isCreateMode
                ? tool === "file" || tool === "photo"
                  ? "Upload & Add"
                  : "Create & Add"
                : "Add"}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        {isCreateMode ? (
          <CollectionPickerCreate
            tool={tool}
            busy={busy}
            createYouTubeUrl={createYouTubeUrl}
            setCreateYouTubeUrl={setCreateYouTubeUrl}
            createPlannerWidgetType={createPlannerWidgetType}
            setCreatePlannerWidgetType={setCreatePlannerWidgetType}
            createPlannerWidgetTitle={createPlannerWidgetTitle}
            setCreatePlannerWidgetTitle={setCreatePlannerWidgetTitle}
            onSubmit={createAndAdd}
            fileInputRef={fileInputRef}
            photoInputRef={photoInputRef}
            uploadAndAddFiles={uploadAndAddFiles}
          />
        ) : (
          <CollectionPickerExisting
            tool={tool}
            loading={loading}
            search={search}
            setSearch={setSearch}
            filtered={filtered}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            existingKeys={existingKeys}
          />
        )}
      </div>
    </Modal>
  );
}
