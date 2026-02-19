import { useEffect, useMemo, useReducer, useRef } from "react";

import Modal from "../../../../../shared/ui/modals/Modal";
import { useToast } from "../../../../../hooks/useToast";

import CollectionPickerCreate from "./CollectionPickerCreate";
import CollectionPickerExisting from "./CollectionPickerExisting";
import { useCollectionPickerItems } from "../hooks/useCollectionPickerItems";
import { useCollectionPickerActions } from "../hooks/useCollectionPickerActions";

const COLLECTION_PICKER_INITIAL_STATE = {
  mode: "existing",
  busy: false,
  createYouTubeUrl: "",
  createPlannerWidgetType: "todo-list",
  createPlannerWidgetTitle: "",
};

function collectionPickerReducer(state, action) {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.payload };
    case "SET_BUSY":
      return { ...state, busy: action.payload };
    case "SET_CREATE_YOUTUBE_URL":
      return { ...state, createYouTubeUrl: action.payload };
    case "SET_CREATE_PLANNER_WIDGET_TYPE":
      return { ...state, createPlannerWidgetType: action.payload };
    case "SET_CREATE_PLANNER_WIDGET_TITLE":
      return { ...state, createPlannerWidgetTitle: action.payload };
    case "RESET_FOR_OPEN":
      return {
        ...state,
        mode: action.payload === "planner" ? "create" : "existing",
        createYouTubeUrl: "",
        createPlannerWidgetType: "todo-list",
        createPlannerWidgetTitle: "",
      };
    default:
      return state;
  }
}

export default function CollectionPickerModal({
  open,
  tool,
  onClose,
  collectionId,
  existingKeys,
  onAdded,
}) {
  const toast = useToast();

  const [pickerState, dispatchPicker] = useReducer(
    collectionPickerReducer,
    COLLECTION_PICKER_INITIAL_STATE,
  );
  const isCreateMode = pickerState.mode === "create";

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
      setBusy: (value) => dispatchPicker({ type: "SET_BUSY", payload: value }),
      fileInputRef,
      photoInputRef,
      createYouTubeUrl: pickerState.createYouTubeUrl,
      createPlannerWidgetType: pickerState.createPlannerWidgetType,
      createPlannerWidgetTitle: pickerState.createPlannerWidgetTitle,
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
    dispatchPicker({ type: "RESET_FOR_OPEN", payload: tool });
    setSearch("");
    setSelectedId(null);
  }, [open, setSearch, setSelectedId, tool]);

  const primaryDisabled = pickerState.busy || (!isCreateMode && !selectedId);

  return (
    <Modal
      open={open}
      onClose={() => {
        if (pickerState.busy) return;
        onClose?.();
      }}
      title={title}
      description={description}
      footer={
        <div className="flex items-center justify-between gap-2">
          {isCreateMode ? (
            <button
              type="button"
              onClick={() =>
                dispatchPicker({ type: "SET_MODE", payload: "existing" })
              }
              className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
              disabled={pickerState.busy}
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
                dispatchPicker({
                  type: "SET_MODE",
                  payload: isCreateMode ? "existing" : "create",
                })
              }
              className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
              disabled={pickerState.busy}
            >
              {isCreateMode ? "Pick existing" : "Create new"}
            </button>

            <button
              type="button"
              onClick={() => onClose?.()}
              className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
              disabled={pickerState.busy}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={isCreateMode ? createAndAdd : submitExisting}
              className="dp-btn-primary rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
              disabled={primaryDisabled}
            >
              {pickerState.busy
                ? "Working..."
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
            busy={pickerState.busy}
            createYouTubeUrl={pickerState.createYouTubeUrl}
            setCreateYouTubeUrl={(value) =>
              dispatchPicker({ type: "SET_CREATE_YOUTUBE_URL", payload: value })
            }
            createPlannerWidgetType={pickerState.createPlannerWidgetType}
            setCreatePlannerWidgetType={(value) =>
              dispatchPicker({
                type: "SET_CREATE_PLANNER_WIDGET_TYPE",
                payload: value,
              })
            }
            createPlannerWidgetTitle={pickerState.createPlannerWidgetTitle}
            setCreatePlannerWidgetTitle={(value) =>
              dispatchPicker({
                type: "SET_CREATE_PLANNER_WIDGET_TITLE",
                payload: value,
              })
            }
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
