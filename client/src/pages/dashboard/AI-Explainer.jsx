import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DashboardPageLayout from "../../layouts/Dashboard/DashboardPage.layout";
import { useToast } from "../../hooks/useToast";
import { contentAPI } from "../../services/api";
import AddToCollectionModal from "../../components/Modals/AddToCollectionModal";
import DeleteConfirmModal from "../../components/Modals/DeleteConfirmModal";
import { Plus, Trash2 } from "lucide-react";

const normalizeUrl = (raw) => {
  const value = (raw || "").trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.toString();
  } catch {
    // If user omitted protocol
    try {
      const url = new URL(`https://${value}`);
      return url.toString();
    } catch {
      return null;
    }
  }
};

export default function AIExplainerPage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [addToCollectionItem, setAddToCollectionItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isAdding, setIsAdding] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isAdding) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [isAdding]);

  const selected = useMemo(
    () => items.find((x) => x.id === selectedId) || null,
    [items, selectedId]
  );

  const loadSaved = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await contentAPI.getAll(1, 50);
      if (!res?.success) throw new Error(res?.message || "Failed to load URLs");

      const mapped = (res.data || []).map((x) => ({
        id: x._id,
        title: x.title || x.url,
        url: x.url,
        domain: x.domain,
      }));
      setItems(mapped);
      setSelectedId((prev) => prev || mapped?.[0]?.id || null);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to load URLs";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  const addUrl = useCallback(async () => {
    const normalized = normalizeUrl(urlInput);
    if (!normalized) {
      toast.warning("Paste a valid URL.");
      return;
    }

    const already = items.find((x) => x.url === normalized);
    if (already) {
      setSelectedId(already.id);
      setUrlInput("");
      setIsAdding(false);
      toast.info("That URL is already saved.");
      return;
    }

    try {
      setIsLoading(true);
      // This endpoint both extracts and saves the URL to the DB.
      const res = await contentAPI.extractContent(normalized);
      if (!res?.success) {
        throw new Error(res?.message || "Failed to save URL");
      }

      const saved = res.data;
      const savedItem = {
        id: saved._id,
        title: saved.title || saved.url,
        url: saved.url,
        domain: saved.domain,
      };

      setItems((prev) => [savedItem, ...prev]);
      setSelectedId(savedItem.id);
      setUrlInput("");
      setIsAdding(false);
      toast.success("URL saved.");
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to save URL";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [items, toast, urlInput]);

  const confirmDelete = useCallback(async () => {
    const id = deleteItem?.id;
    if (!id) return;

    try {
      setIsDeleting(true);
      const res = await contentAPI.delete(id);
      if (!res?.success) {
        throw new Error(res?.message || "Failed to delete URL");
      }

      setItems((prev) => {
        const remaining = prev.filter((x) => x.id !== id);
        setSelectedId((prevSelected) =>
          prevSelected === id ? remaining?.[0]?.id || null : prevSelected
        );
        return remaining;
      });

      toast.success("URL deleted.");
      setDeleteItem(null);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to delete URL";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteItem?.id, toast]);

  const viewer = selected ? (
    <div className="h-[520px] w-full">
      <iframe
        title={selected.title}
        className="h-full w-full"
        src={selected.url}
        sandbox="allow-forms allow-same-origin allow-scripts allow-popups"
      />
    </div>
  ) : (
    <div className="p-6">
      <p className="dp-text font-semibold">No page selected</p>
      <p className="dp-text-muted mt-1 text-sm">
        Add a URL and select it from the playlist.
      </p>
    </div>
  );

  return (
    <>
      <DashboardPageLayout
        title="AI Explainer"
        searchValue={search}
        onSearchChange={setSearch}
        addLabel={isAdding ? (isLoading ? "Saving…" : "Save") : "Add"}
        onAdd={() => {
          if (!isAdding) {
            setIsAdding(true);
            return;
          }
          if (!isLoading) addUrl();
        }}
        addDisabled={isLoading}
        items={items}
        selectedId={selectedId}
        onSelect={(it) => setSelectedId(it.id)}
        renderItemTitle={(it) => it.title}
        renderItemSubtitle={(it) => it.domain || it.url}
        renderItemActions={(it) => {
          const disabled = isLoading;
          return (
            <>
              <button
                type="button"
                className="dp-btn-icon inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors disabled:opacity-60"
                disabled={disabled}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setAddToCollectionItem(it);
                }}
                aria-label="Add to collection"
                title="Add to collection"
              >
                <Plus size={16} />
              </button>
              <button
                type="button"
                className="dp-btn-icon inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors disabled:opacity-60"
                disabled={disabled}
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!it?.id) return;
                  setDeleteItem(it);
                }}
                aria-label="Delete"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </>
          );
        }}
        renderEmptySidebar={
          <div className="p-4 text-center">
            <p className="dp-text font-semibold">No URLs yet</p>
            <p className="dp-text-muted mt-1 text-sm">
              Click “Add” to paste a URL.
            </p>
          </div>
        }
        viewer={
          <div className="h-full">
            <div className="dp-surface dp-border border-b px-4 py-3">
              <p className="dp-text font-semibold truncate">
                {selected ? selected.title : "Viewer"}
              </p>
            </div>

            <div className="p-4">
              {isAdding ? (
                <div className="dp-surface-muted dp-border rounded-2xl border p-4">
                  <p className="dp-text font-semibold">Add a URL</p>
                  <p className="dp-text-muted mt-1 text-sm">
                    Paste a URL to view it here.
                  </p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      ref={inputRef}
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com"
                      className="dp-surface dp-border dp-text w-full rounded-xl border px-4 py-2 text-sm outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={addUrl}
                        className="dp-btn-primary rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
                        disabled={isLoading}
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAdding(false);
                          setUrlInput("");
                        }}
                        className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  <p className="dp-text-subtle mt-3 text-xs">
                    Some sites block embedding in iframes.
                  </p>
                </div>
              ) : null}

              {viewer}
            </div>
          </div>
        }
      />

      <AddToCollectionModal
        open={Boolean(addToCollectionItem)}
        onClose={() => setAddToCollectionItem(null)}
        itemType="content"
        itemId={addToCollectionItem?.id || null}
        itemTitle={addToCollectionItem?.title || null}
      />

      <DeleteConfirmModal
        open={Boolean(deleteItem)}
        onClose={() => {
          if (isDeleting) return;
          setDeleteItem(null);
        }}
        onConfirm={confirmDelete}
        title={deleteItem?.title ? `Delete: ${deleteItem.title}` : "Delete URL"}
        description="Delete this saved URL?"
        busy={isDeleting}
      />
    </>
  );
}
