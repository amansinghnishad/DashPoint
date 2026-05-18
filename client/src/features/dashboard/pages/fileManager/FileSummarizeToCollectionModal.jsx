import { useCallback, useEffect, useMemo, useState } from "react";

import useApiRequest from "@/shared/hooks/useApiRequest";
import { getCollectionsFromResponse } from "@/shared/lib/collections/collectionsResponse";

import { useToast } from "../../../../hooks/useToast";
import { collectionsAPI } from "../../../../services/modules/collectionsApi";
import fileService from "../../../../services/modules/fileService";
import Modal from "../../../../shared/ui/modals/Modal";
import { styleTheme } from "../../../../shared/ui/theme/styleTheme";

const buildDefaultTitle = (fileItem) => {
  const source = String(fileItem?.title || "Document").trim();
  if (!source) return "Summary: Document";
  return `Summary: ${source}`.slice(0, 100);
};

export default function FileSummarizeToCollectionModal({ open, onClose, fileItem }) {
  const toast = useToast();
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const { loading: loadingCollections, run: runLoadCollections } = useApiRequest();
  const { loading: submitting, run: runSubmitSummary } = useApiRequest();

  const fileId = String(fileItem?.id || "").trim();
  const fileTitle = String(fileItem?.title || "").trim();

  const canSubmit =
    Boolean(fileId) && Boolean(selectedCollectionId) && !loadingCollections && !submitting;

  const title = useMemo(() => {
    if (fileTitle) {
      return `Summarize PDF: ${fileTitle}`;
    }
    return "Summarize PDF";
  }, [fileTitle]);

  const loadCollections = useCallback(async () => {
    const response = await runLoadCollections(
      async () => {
        const result = await collectionsAPI.getCollections(1, 100, "");
        if (!result?.success) {
          throw new Error(result?.message || "Failed to load collections");
        }
        return result;
      },
      {
        fallbackMessage: "Failed to load collections",
        onError: (message) => {
          toast.error(message);
          setCollections([]);
          setSelectedCollectionId("");
        },
      },
    );

    if (!response) {
      return;
    }

    const list = getCollectionsFromResponse(response);
    setCollections(list);
    setSelectedCollectionId((prev) => prev || String(list?.[0]?._id || list?.[0]?.id || ""));
  }, [runLoadCollections, toast]);

  useEffect(() => {
    if (!open) return;
    setNoteTitle(buildDefaultTitle(fileItem));
    loadCollections();
  }, [fileItem, loadCollections, open]);

  const submit = useCallback(async () => {
    if (!fileId) {
      toast.error("Missing file id.");
      return;
    }

    if (!selectedCollectionId) {
      toast.warning("Select a collection.");
      return;
    }

    const response = await runSubmitSummary(
      async () => {
        const result = await fileService.summarizeFileToCollection(fileId, {
          collectionId: selectedCollectionId,
          noteTitle: String(noteTitle || "").trim(),
        });

        if (!result?.success) {
          throw new Error(result?.message || "Failed to summarize PDF");
        }

        return result;
      },
      {
        fallbackMessage: "Failed to summarize PDF",
        onError: (message) => toast.error(message),
      },
    );

    if (!response) {
      return;
    }

    const collectionName = response?.data?.collection?.name || "selected collection";
    toast.success(`Summary saved to ${collectionName}.`);
    onClose?.();
  }, [fileId, noteTitle, onClose, runSubmitSummary, selectedCollectionId, toast]);

  return (
    <Modal
      open={open}
      onClose={() => {
        if (submitting) return;
        onClose?.();
      }}
      title={title}
      description="Choose the collection where the generated summary note should be saved."
      disableClose={submitting}
      size="sm"
      footer={
        <div className={styleTheme.modal.footerActionsEnd}>
          <button
            type="button"
            onClick={onClose}
            className={styleTheme.button.secondary}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            className={styleTheme.button.primary}
            disabled={!canSubmit}
          >
            {submitting ? "Saving..." : "Summarize & Save"}
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        <label className="block">
          <span className="dp-text-muted text-xs font-semibold">Note title</span>
          <input
            value={noteTitle}
            onChange={(event) => setNoteTitle(event.target.value)}
            placeholder="Summary title"
            className="dp-surface dp-border dp-text mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none"
            maxLength={100}
            disabled={submitting}
          />
        </label>

        <div>
          <p className="dp-text-muted text-xs font-semibold">Collection</p>
          {loadingCollections ? (
            <p className="dp-text-muted mt-1 text-sm">Loading collections...</p>
          ) : collections.length ? (
            <div className="mt-2 space-y-2 max-h-56 overflow-auto">
              {collections.map((collection) => {
                const id = String(collection?._id || collection?.id || "");
                if (!id) return null;
                const active = id === selectedCollectionId;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedCollectionId(id)}
                    className={`w-full rounded-xl border px-3 py-2 text-left transition-colors ${
                      active ? "dp-border dp-surface-muted border-2" : "dp-border dp-surface"
                    }`}
                    disabled={submitting}
                  >
                    <p className="dp-text text-sm font-semibold truncate">
                      {collection?.name || "Untitled"}
                    </p>
                    {collection?.description ? (
                      <p className="dp-text-muted mt-0.5 text-xs line-clamp-2">
                        {collection.description}
                      </p>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="dp-text-muted mt-1 text-sm">No collections found. Create one first.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
