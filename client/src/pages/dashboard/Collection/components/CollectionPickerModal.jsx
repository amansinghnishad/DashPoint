import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Modal from "../../../../components/Modals/Modal";
import fileService from "../../../../services/fileService";
import { useToast } from "../../../../hooks/useToast";
import {
  collectionsAPI,
  stickyNotesAPI,
  todoAPI,
  youtubeAPI,
} from "../../../../services/api";
import { extractYouTubeId } from "../../../../utils/urlUtils";

const getPickerCollectionItemType = (tool) => {
  if (tool === "note") return "sticky-note";
  if (tool === "todo") return "todo";
  if (tool === "youtube") return "youtube";
  if (tool === "file") return "file";
  if (tool === "photo") return "file";
  return null;
};

const getPickerItemId = (it) => it?._id || it?.id || null;

const getPickerItemLabel = (tool, it) => {
  if (tool === "youtube") {
    return {
      title: it?.title || "Untitled",
      subtitle: it?.channelTitle || "YouTube",
    };
  }

  if (tool === "note") {
    return {
      title: it?.title || "Untitled",
      subtitle: it?.content || "",
    };
  }

  if (tool === "todo") {
    return {
      title: it?.title || "Untitled",
      subtitle: it?.completed ? "Completed" : "Open",
    };
  }

  return {
    title: it?.originalName || it?.filename || "File",
    subtitle: it?.formattedSize || it?.mimetype || "",
  };
};

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

  const [loading, setLoading] = useState(false);
  const [pickerItems, setPickerItems] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [busy, setBusy] = useState(false);

  const [createYouTubeUrl, setCreateYouTubeUrl] = useState("");
  const [createNoteTitle, setCreateNoteTitle] = useState("");
  const [createNoteContent, setCreateNoteContent] = useState("");
  const [createTodoTitle, setCreateTodoTitle] = useState("");

  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);

  const title = useMemo(() => {
    switch (tool) {
      case "youtube":
        return "Add YouTube";
      case "note":
        return "Add sticky note";
      case "todo":
        return "Add todo";
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
      case "youtube":
        return "Pick from your saved videos.";
      case "note":
        return "Pick from your existing sticky notes.";
      case "todo":
        return "Pick from your existing tasks.";
      case "photo":
        return "Pick from your uploaded images.";
      case "file":
        return "Pick from your uploaded files.";
      default:
        return "Pick an item to add.";
    }
  }, [tool]);

  const filtered = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return pickerItems;

    return pickerItems.filter((it) => {
      const t = it?.title || it?.name || it?.originalName || it?.filename || "";
      const s = it?.channelTitle || it?.mimetype || it?.formattedSize || "";
      return `${t} ${s}`.toLowerCase().includes(q);
    });
  }, [pickerItems, search]);

  const loadItems = useCallback(
    async (toolId) => {
      if (!toolId) return;
      try {
        setLoading(true);
        setPickerItems([]);
        setSearch("");
        setSelectedId(null);

        if (toolId === "youtube") {
          const res = await youtubeAPI.getAll(1, 100);
          if (!res?.success)
            throw new Error(res?.message || "Failed to load videos");
          const list = Array.isArray(res.data) ? res.data : [];
          setPickerItems(list);
          setSelectedId(list?.[0]?._id || null);
          return;
        }

        if (toolId === "note") {
          const res = await stickyNotesAPI.getAll();
          if (!res?.success)
            throw new Error(res?.message || "Failed to load notes");
          const list = Array.isArray(res.data) ? res.data : [];
          setPickerItems(list);
          setSelectedId(list?.[0]?._id || null);
          return;
        }

        if (toolId === "todo") {
          const res = await todoAPI.getAll();
          if (!res?.success)
            throw new Error(res?.message || "Failed to load todos");
          const list = Array.isArray(res.data) ? res.data : [];
          setPickerItems(list);
          setSelectedId(list?.[0]?._id || null);
          return;
        }

        if (toolId === "file" || toolId === "photo") {
          const res = await fileService.getFiles({ page: 1, limit: 200 });
          if (!res?.success) {
            throw new Error(
              res?.error || res?.message || "Failed to load files"
            );
          }

          const list = Array.isArray(res.data) ? res.data : [];
          const next =
            toolId === "photo"
              ? list.filter((f) =>
                  String(f?.mimetype || "").startsWith("image/")
                )
              : list;

          setPickerItems(next);
          setSelectedId(next?.[0]?._id || null);
        }
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load items";
        toast.error(message);
        setPickerItems([]);
        setSelectedId(null);
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    if (!open) return;
    setMode("existing");
    setCreateYouTubeUrl("");
    setCreateNoteTitle("");
    setCreateNoteContent("");
    setCreateTodoTitle("");
    loadItems(tool);
  }, [loadItems, open, tool]);

  const addCollectionItem = useCallback(
    async (itemType, itemId) => {
      const res = await collectionsAPI.addItemToCollection(
        collectionId,
        itemType,
        itemId
      );
      if (!res?.success) {
        throw new Error(res?.message || "Failed to add item to collection");
      }
    },
    [collectionId]
  );

  const submitExisting = useCallback(async () => {
    const itemType = getPickerCollectionItemType(tool);
    const itemId = selectedId;
    if (!itemType || !itemId) {
      toast.warning("Select an item first.");
      return;
    }

    const key = `${itemType}:${itemId}`;
    if (existingKeys?.has?.(key)) {
      toast.info("That item is already in this collection.");
      onClose?.();
      return;
    }

    try {
      setBusy(true);
      await addCollectionItem(itemType, String(itemId));
      toast.success("Added to collection.");
      onClose?.();
      await onAdded?.();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to add item to collection";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }, [
    addCollectionItem,
    existingKeys,
    onAdded,
    onClose,
    selectedId,
    toast,
    tool,
  ]);

  const uploadAndAddFiles = useCallback(
    async (fileList, acceptType) => {
      const files = Array.from(fileList || []);
      if (!files.length) return;

      try {
        setBusy(true);
        const res = await fileService.uploadFiles(files);
        if (!res?.success) {
          throw new Error(res?.error || res?.message || "Upload failed");
        }

        const uploaded = Array.isArray(res.data) ? res.data : [];
        if (!uploaded.length) throw new Error("No files were uploaded");

        for (const f of uploaded) {
          if (f?._id) {
            await addCollectionItem("file", String(f._id));
          }
        }

        toast.success(
          acceptType === "photo" ? "Photo(s) added." : "File(s) added."
        );
        onClose?.();
        await onAdded?.();
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to upload files";
        toast.error(message);
      } finally {
        setBusy(false);
      }
    },
    [addCollectionItem, onAdded, onClose, toast]
  );

  const createAndAdd = useCallback(async () => {
    if (tool === "file") {
      fileInputRef.current?.click();
      return;
    }

    if (tool === "photo") {
      photoInputRef.current?.click();
      return;
    }

    try {
      setBusy(true);

      if (tool === "youtube") {
        const raw = createYouTubeUrl.trim();
        if (!raw) {
          toast.warning("Paste a YouTube link first.");
          return;
        }
        const videoId = extractYouTubeId(raw);
        if (!videoId) {
          toast.error("Invalid YouTube URL.");
          return;
        }

        const detailsRes = await youtubeAPI.getVideoDetails(videoId);
        if (!detailsRes?.success) {
          throw new Error(
            detailsRes?.message || "Failed to fetch video details"
          );
        }
        const details = detailsRes.data;
        const thumb =
          details?.thumbnail?.maxres ||
          details?.thumbnail?.high ||
          details?.thumbnail?.medium ||
          details?.thumbnail?.default ||
          null;
        if (!thumb) throw new Error("Missing thumbnail from YouTube details");

        const createRes = await youtubeAPI.create({
          videoId,
          title: (details.title || `YouTube: ${videoId}`).slice(0, 200),
          thumbnail: thumb,
          embedUrl:
            details.embedUrl || `https://www.youtube.com/embed/${videoId}`,
          url:
            details.url || raw || `https://www.youtube.com/watch?v=${videoId}`,
          channelTitle: details.channelTitle
            ? String(details.channelTitle).slice(0, 100)
            : undefined,
          description: details.description
            ? String(details.description).slice(0, 1000)
            : undefined,
          tags: Array.isArray(details.tags)
            ? details.tags
                .map((t) => String(t).trim())
                .filter(Boolean)
                .slice(0, 50)
            : undefined,
        });
        if (!createRes?.success) {
          throw new Error(createRes?.message || "Failed to save video");
        }
        const saved = createRes.data;
        if (!saved?._id) throw new Error("Save succeeded but missing id");

        await addCollectionItem("youtube", String(saved._id));
        toast.success("YouTube video added.");
        onClose?.();
        await onAdded?.();
        return;
      }

      if (tool === "note") {
        const titleValue = createNoteTitle.trim();
        const contentValue = createNoteContent.trim();
        if (!titleValue && !contentValue) {
          toast.warning("Write something first.");
          return;
        }

        const res = await stickyNotesAPI.create({
          title: titleValue || "Untitled",
          content: contentValue,
        });
        if (!res?.success)
          throw new Error(res?.message || "Failed to create note");
        const created = res.data;
        if (!created?._id) throw new Error("Note created but missing id");

        await addCollectionItem("sticky-note", String(created._id));
        toast.success("Note added.");
        onClose?.();
        await onAdded?.();
        return;
      }

      if (tool === "todo") {
        const titleValue = createTodoTitle.trim();
        if (!titleValue) {
          toast.warning("Enter a task title.");
          return;
        }

        const res = await todoAPI.create({
          title: titleValue,
          completed: false,
        });
        if (!res?.success)
          throw new Error(res?.message || "Failed to create task");
        const created = res.data;
        if (!created?._id) throw new Error("Task created but missing id");

        await addCollectionItem("todo", String(created._id));
        toast.success("Task added.");
        onClose?.();
        await onAdded?.();
      }
    } catch (err) {
      const status = err?.response?.status;
      const responseData = err?.response?.data;
      const message =
        responseData?.message || err?.message || "Failed to create item";

      if (status === 400 && Array.isArray(responseData?.errors)) {
        const first = responseData.errors[0];
        const detail = first?.msg || first?.message;
        toast.error(detail || message);
      } else {
        toast.error(message);
      }
    } finally {
      setBusy(false);
    }
  }, [
    addCollectionItem,
    createNoteContent,
    createNoteTitle,
    createTodoTitle,
    createYouTubeUrl,
    onAdded,
    onClose,
    toast,
    tool,
  ]);

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
          <>
            {tool === "youtube" ? (
              <input
                value={createYouTubeUrl}
                onChange={(e) => setCreateYouTubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=…"
                className="dp-surface dp-border dp-text w-full rounded-xl border px-4 py-2 text-sm outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") createAndAdd();
                }}
                disabled={busy}
              />
            ) : null}

            {tool === "note" ? (
              <div className="space-y-2">
                <input
                  value={createNoteTitle}
                  onChange={(e) => setCreateNoteTitle(e.target.value)}
                  placeholder="Title"
                  className="dp-surface dp-border dp-text w-full rounded-xl border px-4 py-2 text-sm outline-none"
                  disabled={busy}
                />
                <textarea
                  value={createNoteContent}
                  onChange={(e) => setCreateNoteContent(e.target.value)}
                  placeholder="Write your note…"
                  className="dp-surface dp-border dp-text w-full min-h-[140px] resize-y rounded-xl border px-4 py-2 text-sm outline-none"
                  disabled={busy}
                />
              </div>
            ) : null}

            {tool === "todo" ? (
              <input
                value={createTodoTitle}
                onChange={(e) => setCreateTodoTitle(e.target.value)}
                placeholder="Task title"
                className="dp-surface dp-border dp-text w-full rounded-xl border px-4 py-2 text-sm outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") createAndAdd();
                }}
                disabled={busy}
              />
            ) : null}

            {tool === "file" || tool === "photo" ? (
              <div className="dp-surface-muted dp-border rounded-2xl border p-4">
                <p className="dp-text font-semibold">Upload</p>
                <p className="dp-text-muted mt-1 text-sm">
                  Choose {tool === "photo" ? "images" : "files"} to upload and
                  add.
                </p>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={createAndAdd}
                    className="dp-btn-primary rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
                    disabled={busy}
                  >
                    {busy ? "Uploading…" : "Choose files"}
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    e.target.value = "";
                    uploadAndAddFiles(files, "file");
                  }}
                />
                <input
                  ref={photoInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    e.target.value = "";
                    uploadAndAddFiles(files, "photo");
                  }}
                />
              </div>
            ) : null}
          </>
        ) : (
          <>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="dp-surface dp-border dp-text w-full rounded-xl border px-4 py-2 text-sm outline-none"
              disabled={loading}
            />

            {loading ? (
              <div className="dp-text-muted text-sm">Loading…</div>
            ) : filtered.length ? (
              <div className="space-y-2">
                {filtered.slice(0, 60).map((it) => {
                  const id = getPickerItemId(it);
                  if (!id) return null;

                  const { title: rowTitle, subtitle } = getPickerItemLabel(
                    tool,
                    it
                  );
                  const itemType = getPickerCollectionItemType(tool);
                  const key = itemType ? `${itemType}:${id}` : null;
                  const alreadyAdded = key ? existingKeys?.has?.(key) : false;
                  const isActive = String(selectedId || "") === String(id);

                  return (
                    <button
                      key={String(id)}
                      type="button"
                      onClick={() => setSelectedId(id)}
                      className={`w-full rounded-2xl px-4 py-3 text-left transition-colors border ${
                        isActive
                          ? "dp-border dp-surface-muted border-2"
                          : "dp-border dp-surface"
                      } ${alreadyAdded ? "opacity-60" : "dp-hover-bg"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="dp-text font-semibold truncate">
                            {rowTitle}
                          </p>
                          {subtitle ? (
                            <p className="dp-text-muted mt-0.5 text-sm line-clamp-2">
                              {subtitle}
                            </p>
                          ) : null}
                        </div>
                        {alreadyAdded ? (
                          <span className="dp-text-muted text-xs whitespace-nowrap">
                            Added
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}

                {filtered.length > 60 ? (
                  <p className="dp-text-muted text-xs">
                    Showing 60 of {filtered.length}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="dp-surface-muted dp-border rounded-2xl border p-4">
                <p className="dp-text font-semibold">Nothing to add</p>
                <p className="dp-text-muted mt-1 text-sm">
                  Use “Create new” to add items from here.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
