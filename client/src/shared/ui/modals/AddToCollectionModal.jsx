import { useCallback, useEffect, useMemo, useState } from "react";

import useApiRequest from "@/shared/hooks/useApiRequest";
import { getCollectionsFromResponse } from "@/shared/lib/collections/collectionsResponse";

import Modal from "./Modal";
import { useToast } from "../../../hooks/useToast";
import { collectionsAPI } from "../../../services/modules/collectionsApi";
import { styleTheme } from "../theme/styleTheme";

export default function AddToCollectionModal({ open, onClose, itemType, itemId, itemTitle }) {
  const toast = useToast();
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const { loading, run } = useApiRequest();

  const canSubmit = Boolean(selectedCollectionId) && !loading;

  const title = useMemo(() => {
    if (itemTitle) return `Add to collection: ${itemTitle}`;
    return "Add to collection";
  }, [itemTitle]);

  const loadCollections = useCallback(async () => {
    const response = await run(
      async () => {
        const result = await collectionsAPI.getCollections(1, 50, "");
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
          setSelectedCollectionId(null);
        },
      },
    );

    if (!response) {
      return;
    }

    const normalized = getCollectionsFromResponse(response);
    setCollections(normalized);
    setSelectedCollectionId((prev) => prev || normalized?.[0]?._id || normalized?.[0]?.id || null);
  }, [run, toast]);

  useEffect(() => {
    if (!open) return;
    loadCollections();
  }, [itemId, itemType, loadCollections, open]);

  const submit = useCallback(async () => {
    if (!itemType || !itemId) {
      toast.error("Missing item info.");
      return;
    }
    if (!selectedCollectionId) {
      toast.warning("Pick a collection first.");
      return;
    }

    const response = await run(
      async () => {
        const result = await collectionsAPI.addItemToCollection(
          selectedCollectionId,
          itemType,
          itemId,
        );
        if (!result?.success) {
          throw new Error(result?.message || "Failed to add item to collection");
        }
        return result;
      },
      {
        fallbackMessage: "Failed to add item to collection",
        onError: (message) => toast.error(message),
      },
    );

    if (!response) {
      return;
    }

    toast.success("Added to collection.");
    onClose?.();
  }, [itemId, itemType, onClose, run, selectedCollectionId, toast]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description="Choose a collection to add this item to."
      footer={
        <div className={styleTheme.modal.footerActionsEnd}>
          <button
            type="button"
            onClick={onClose}
            className={styleTheme.button.secondary}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            className={styleTheme.button.primary}
            disabled={!canSubmit}
          >
            Add
          </button>
        </div>
      }
    >
      {loading && !collections.length ? (
        <div className="dp-text-muted text-sm">Loading collections...</div>
      ) : collections.length ? (
        <div className="space-y-2">
          {collections.map((c) => {
            const id = c?._id || c?.id;
            if (!id) return null;
            const isActive = id === selectedCollectionId;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedCollectionId(id)}
                className={`w-full rounded-2xl px-4 py-3 text-left transition-colors ${
                  isActive
                    ? "dp-border dp-surface-muted border-2 shadow-lg"
                    : "dp-border dp-surface border"
                } ${isActive ? "" : "dp-hover-bg"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="dp-text font-semibold truncate">{c?.name || "Untitled"}</p>
                    {c?.description ? (
                      <p className="dp-text-muted mt-0.5 text-sm line-clamp-2">{c.description}</p>
                    ) : null}
                  </div>
                  <div
                    className={`mt-1 h-4 w-4 shrink-0 rounded-full border ${
                      isActive ? "dp-border dp-surface" : "dp-border"
                    }`}
                    aria-hidden="true"
                  />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="dp-text-muted text-sm">
          No collections found. Create one from the Collections page first.
        </div>
      )}
    </Modal>
  );
}
