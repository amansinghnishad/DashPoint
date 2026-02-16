import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DashboardPageLayout from "../layouts/DashboardPageLayout";
import { useToast } from "../../../hooks/useToast";
import fileService from "../../../services/modules/fileService";
import AddToCollectionModal from "../../../shared/ui/modals/AddToCollectionModal";
import DeleteConfirmModal from "../../../shared/ui/modals/DeleteConfirmModal";
import { IconAdd, IconDelete } from "@/shared/ui/icons";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SERVER_BASE_URL = API_BASE_URL.replace(/\/?api\/?$/, "");

const resolveFileUrl = (serverBaseUrl, url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${serverBaseUrl}${url}`;
};

const isProbablyText = (mime) => {
  if (!mime) return false;
  return (
    mime.startsWith("text/") ||
    mime === "application/json" ||
    mime === "application/xml" ||
    mime === "application/javascript"
  );
};

export default function FileManagerPage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [textPreview, setTextPreview] = useState(null);
  const [isBusy, setIsBusy] = useState(false);
  const [addToCollectionItem, setAddToCollectionItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef(null);

  const selected = useMemo(
    () => items.find((x) => x.id === selectedId) || null,
    [items, selectedId]
  );

  const loadFiles = useCallback(async () => {
    try {
      setIsBusy(true);
      const res = await fileService.getFiles({ page: 1, limit: 50 });
      if (!res?.success) {
        throw new Error(res?.error || res?.message || "Failed to load files");
      }

      const mapped = (res.data || []).map((f) => ({
        id: f._id,
        title: f.originalName,
        subtitle: f.formattedSize || "",
        type: "file",
        mime: f.mimetype,
        remoteUrl: resolveFileUrl(SERVER_BASE_URL, f.url),
        downloadUrl: f._id
          ? `${SERVER_BASE_URL}/api/files/${f._id}/download`
          : null,
        _raw: f,
      }));

      setItems(mapped);
      setSelectedId((prev) => prev || mapped?.[0]?.id || null);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to load files";
      toast.error(message);
    } finally {
      setIsBusy(false);
    }
  }, [toast]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const onPickFiles = useCallback(
    async (e) => {
      // Copy files before clearing the input. In some browsers the FileList becomes
      // empty after resetting the input value.
      const files = Array.from(e.target.files || []);
      // allow picking same file again
      e.target.value = "";
      if (!files.length) return;

      try {
        setIsBusy(true);
        const res = await fileService.uploadFiles(files);
        if (!res?.success) {
          throw new Error(res?.error || res?.message || "Upload failed");
        }

        const uploaded = (res.data || []).map((f) => ({
          id: f._id,
          title: f.originalName,
          subtitle: f.formattedSize || "",
          type: "file",
          mime: f.mimetype,
          remoteUrl: resolveFileUrl(SERVER_BASE_URL, f.url),
          downloadUrl: f._id
            ? `${SERVER_BASE_URL}/api/files/${f._id}/download`
            : null,
          _raw: f,
        }));

        setItems((prev) => {
          const existingIds = new Set(prev.map((x) => x.id));
          const nextUploads = uploaded.filter((u) => !existingIds.has(u.id));
          return [...nextUploads, ...prev];
        });
        setSelectedId(uploaded?.[0]?.id || selectedId);
        toast.success("File(s) uploaded.");
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to upload files";
        toast.error(message);
      } finally {
        setIsBusy(false);
      }
    },
    [selectedId, toast]
  );

  useEffect(() => {
    const loadText = async () => {
      if (!selected || selected.type !== "file") {
        setTextPreview(null);
        return;
      }

      if (!isProbablyText(selected.mime)) {
        setTextPreview(null);
        return;
      }

      try {
        if (selected.remoteUrl) {
          const resp = await fetch(selected.remoteUrl);
          if (!resp.ok) throw new Error("Failed to fetch file");
          const text = await resp.text();
          setTextPreview(text);
        } else {
          setTextPreview(null);
        }
      } catch {
        setTextPreview(null);
      }
    };

    loadText();
  }, [selected]);

  const confirmDelete = useCallback(async () => {
    const id = deleteItem?.id;
    if (!id) return;

    try {
      setIsDeleting(true);
      const res = await fileService.deleteFile(id);
      if (!res?.success) {
        throw new Error(res?.error || res?.message || "Delete failed");
      }

      setItems((prev) => {
        const remaining = prev.filter((x) => x.id !== id);
        setSelectedId((prevSelected) =>
          prevSelected === id ? remaining?.[0]?.id || null : prevSelected
        );
        return remaining;
      });

      toast.success("File deleted.");
      setDeleteItem(null);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to delete file";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteItem?.id, toast]);

  const viewer = selected ? (
    <div className="p-4">
      {selected.type === "file" ? (
        <div>
          <div className="mb-3">
            <p className="dp-text font-semibold truncate">{selected.title}</p>
            <p className="dp-text-muted text-sm truncate">
              {selected.subtitle}
            </p>
          </div>

          {selected.mime?.startsWith("image/") && selected.remoteUrl ? (
            <img
              src={selected.remoteUrl}
              alt={selected.title}
              className="max-h-[520px] w-full object-contain dp-surface"
            />
          ) : selected.mime === "application/pdf" && selected.remoteUrl ? (
            <iframe
              title={selected.title}
              className="h-[520px] w-full"
              src={selected.remoteUrl}
            />
          ) : textPreview != null ? (
            <pre className="dp-surface dp-border dp-text max-h-[520px] overflow-auto rounded-2xl border p-4 text-sm whitespace-pre-wrap">
              {textPreview}
            </pre>
          ) : (
            <div className="dp-surface-muted dp-border rounded-2xl border p-4">
              <p className="dp-text font-semibold">Preview not available</p>
              <p className="dp-text-muted mt-1 text-sm">
                This file type can't be previewed yet.
              </p>
              {selected.downloadUrl ? (
                <a
                  href={selected.downloadUrl}
                  className="dp-text mt-3 inline-block text-sm underline"
                >
                  Download
                </a>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  ) : (
    <div className="p-6">
      <p className="dp-text font-semibold">No file selected</p>
      <p className="dp-text-muted mt-1 text-sm">
        Add files and select one from the playlist.
      </p>
    </div>
  );

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={onPickFiles}
        accept="image/*,application/pdf,text/*,.md,.json,.csv"
      />

      <DashboardPageLayout
        title="File Manager"
        searchValue={search}
        onSearchChange={setSearch}
        addLabel="Add"
        onAdd={() => {
          if (!fileInputRef.current) {
            toast.error("File picker not available.");
            return;
          }
          fileInputRef.current.click();
        }}
        addDisabled={isBusy}
        items={items}
        selectedId={selectedId}
        onSelect={(it) => setSelectedId(it.id)}
        renderItemTitle={(it) => it.title}
        renderItemSubtitle={(it) => it.subtitle}
        renderItemActions={(it) => {
          const disabled = isBusy;
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
                <IconAdd size={16} />
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
                <IconDelete size={16} />
              </button>
            </>
          );
        }}
        viewer={
          <div className="h-full">
            <div className="dp-surface dp-border border-b px-4 py-3">
              <p className="dp-text font-semibold truncate">
                {selected ? selected.title : "Viewer"}
              </p>
            </div>
            {viewer}
          </div>
        }
      />

      <AddToCollectionModal
        open={Boolean(addToCollectionItem)}
        onClose={() => setAddToCollectionItem(null)}
        itemType="file"
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
        title={
          deleteItem?.title ? `Delete: ${deleteItem.title}` : "Delete file"
        }
        description="Delete this file?"
        busy={isDeleting}
      />
    </>
  );
}
