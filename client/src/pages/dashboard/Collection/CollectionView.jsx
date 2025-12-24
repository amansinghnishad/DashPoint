import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, FolderOpen } from "lucide-react";
import {
  collectionsAPI,
  stickyNotesAPI,
  todoAPI,
  youtubeAPI,
} from "../../../services/api";
import { useToast } from "../../../hooks/useToast";
import BottomBar from "../../../components/Navbars/BottomBar";
import ResizableItemCard from "../../../components/collection/ResizableItemCard";
import Modal from "../../../components/Modals/Modal";
import DeleteConfirmModal from "../../../components/Modals/DeleteConfirmModal";
import fileService from "../../../services/fileService";
import { extractYouTubeId } from "../../../utils/urlUtils";

const getCollectionId = (collection) => collection?._id || collection?.id;

const getItemKey = (it) => {
  if (!it) return "";
  if (it.itemType && it.itemId) return `${it.itemType}:${it.itemId}`;
  if (it._id) return String(it._id);
  if (it.itemId) return String(it.itemId);
  return "";
};

export default function CollectionView({ collectionId, onBack }) {
  const toast = useToast();
  const [collection, setCollection] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTool, setActiveTool] = useState("youtube");

  const [isToolBusy, setIsToolBusy] = useState(false);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTool, setPickerTool] = useState(null);
  const [pickerMode, setPickerMode] = useState("existing");
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerItems, setPickerItems] = useState([]);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerSelectedId, setPickerSelectedId] = useState(null);

  const [createYouTubeUrl, setCreateYouTubeUrl] = useState("");
  const [createNoteTitle, setCreateNoteTitle] = useState("");
  const [createNoteContent, setCreateNoteContent] = useState("");
  const [createTodoTitle, setCreateTodoTitle] = useState("");

  const createFileInputRef = useRef(null);
  const createPhotoInputRef = useRef(null);

  const [deleteCanvasItem, setDeleteCanvasItem] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const layoutStorageKey = useMemo(() => {
    if (!collectionId) return null;
    return `dashpoint:collection-layout:${collectionId}`;
  }, [collectionId]);

  const [layoutsByItemKey, setLayoutsByItemKey] = useState({});
  const latestLayoutsRef = useRef({});

  const canvasSurfaceRef = useRef(null);

  const getCanvasRect = useCallback(() => {
    const el = canvasSurfaceRef.current;
    if (!el) return null;
    return el.getBoundingClientRect();
  }, []);

  const title = useMemo(() => {
    return collection?.name ? String(collection.name) : "Collection";
  }, [collection?.name]);

  const load = useCallback(async () => {
    if (!collectionId) return;

    setLoading(true);
    try {
      const response = await collectionsAPI.getCollectionWithItems(
        collectionId
      );
      if (!response?.success) {
        throw new Error(response?.message || "Failed to load collection");
      }

      // Server may return collection data directly as data
      const data = response.data?.data ?? response.data;
      setCollection(data);
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load collection";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [collectionId, toast]);

  useEffect(() => {
    latestLayoutsRef.current = layoutsByItemKey;
  }, [layoutsByItemKey]);

  // Load saved layout when collection changes
  useEffect(() => {
    if (!layoutStorageKey) return;
    try {
      const raw = window.localStorage.getItem(layoutStorageKey);
      const parsed = raw ? JSON.parse(raw) : {};
      setLayoutsByItemKey(parsed && typeof parsed === "object" ? parsed : {});
    } catch {
      setLayoutsByItemKey({});
    }
  }, [layoutStorageKey]);

  // Ensure every item has a layout; remove stale entries
  useEffect(() => {
    setLayoutsByItemKey((prev) => {
      const next = { ...prev };
      const existingIds = new Set(
        items.map(getItemKey).filter((k) => typeof k === "string" && k.length)
      );

      Object.keys(next).forEach((key) => {
        if (!existingIds.has(key)) delete next[key];
      });

      const cardW = 320;
      const cardH = 240;
      const gap = 16;

      const rect = getCanvasRect();
      const canvasW = rect?.width ?? 1200;
      const canvasH = rect?.height ?? 700;
      const cols = Math.max(1, Math.floor((canvasW - gap) / (cardW + gap)));

      items.forEach((it, index) => {
        const key = getItemKey(it);
        if (!key) return;
        if (next[key]) return;

        const col = index % cols;
        const row = Math.floor(index / cols);
        let x = col * (cardW + gap) + gap;
        let y = row * (cardH + gap) + gap;

        if (x + cardW > canvasW - gap) x = gap;
        if (y + cardH > canvasH - gap) {
          x = gap;
          y = gap;
        }

        next[key] = { x, y, width: cardW, height: cardH };
      });

      return next;
    });
  }, [getCanvasRect, items]);

  // Persist layout (debounced)
  useEffect(() => {
    if (!layoutStorageKey) return;
    const t = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          layoutStorageKey,
          JSON.stringify(layoutsByItemKey)
        );
      } catch {
        // ignore
      }
    }, 200);

    return () => window.clearTimeout(t);
  }, [layoutStorageKey, layoutsByItemKey]);

  // Flush layouts immediately when leaving
  useEffect(() => {
    if (!layoutStorageKey) return;

    const flush = () => {
      try {
        window.localStorage.setItem(
          layoutStorageKey,
          JSON.stringify(latestLayoutsRef.current || {})
        );
      } catch {
        // ignore
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };

    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      flush();
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [layoutStorageKey]);

  useEffect(() => {
    load();
  }, [load]);

  const existingKeys = useMemo(() => {
    return new Set(
      items.map(getItemKey).filter((k) => typeof k === "string" && k.length)
    );
  }, [items]);

  const pickerTitle = useMemo(() => {
    switch (pickerTool) {
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
  }, [pickerTool]);

  const pickerDescription = useMemo(() => {
    switch (pickerTool) {
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
  }, [pickerTool]);

  const isCreateMode = pickerMode === "create";

  const pickerFiltered = useMemo(() => {
    const q = (pickerSearch || "").trim().toLowerCase();
    if (!q) return pickerItems;

    return pickerItems.filter((it) => {
      const title =
        it?.title || it?.name || it?.originalName || it?.filename || "";
      const subtitle =
        it?.channelTitle || it?.mimetype || it?.formattedSize || "";
      return `${title} ${subtitle}`.toLowerCase().includes(q);
    });
  }, [pickerItems, pickerSearch]);

  const getPickerItemId = useCallback((it) => it?._id || it?.id || null, []);

  const getPickerItemLabel = useCallback(
    (it) => {
      if (pickerTool === "youtube") {
        return {
          title: it?.title || "Untitled",
          subtitle: it?.channelTitle || "YouTube",
        };
      }

      if (pickerTool === "note") {
        return {
          title: it?.title || "Untitled",
          subtitle: it?.content || "",
        };
      }

      if (pickerTool === "todo") {
        return {
          title: it?.title || "Untitled",
          subtitle: it?.completed ? "Completed" : "Open",
        };
      }

      // file / photo
      return {
        title: it?.originalName || it?.filename || "File",
        subtitle: it?.formattedSize || it?.mimetype || "",
      };
    },
    [pickerTool]
  );

  const getPickerCollectionItemType = useCallback(() => {
    if (pickerTool === "note") return "sticky-note";
    if (pickerTool === "todo") return "todo";
    if (pickerTool === "youtube") return "youtube";
    if (pickerTool === "file") return "file";
    if (pickerTool === "photo") return "file";
    return null;
  }, [pickerTool]);

  const loadPickerItems = useCallback(
    async (toolId) => {
      if (!toolId) return;
      try {
        setPickerLoading(true);
        setPickerItems([]);
        setPickerSearch("");
        setPickerSelectedId(null);

        if (toolId === "youtube") {
          const res = await youtubeAPI.getAll(1, 100);
          if (!res?.success) {
            throw new Error(res?.message || "Failed to load videos");
          }
          const list = Array.isArray(res.data) ? res.data : [];
          setPickerItems(list);
          setPickerSelectedId(list?.[0]?._id || null);
          return;
        }

        if (toolId === "note") {
          const res = await stickyNotesAPI.getAll();
          if (!res?.success) {
            throw new Error(res?.message || "Failed to load notes");
          }
          const list = Array.isArray(res.data) ? res.data : [];
          setPickerItems(list);
          setPickerSelectedId(list?.[0]?._id || null);
          return;
        }

        if (toolId === "todo") {
          const res = await todoAPI.getAll();
          if (!res?.success) {
            throw new Error(res?.message || "Failed to load todos");
          }
          const list = Array.isArray(res.data) ? res.data : [];
          setPickerItems(list);
          setPickerSelectedId(list?.[0]?._id || null);
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
          const filtered =
            toolId === "photo"
              ? list.filter((f) =>
                  String(f?.mimetype || "").startsWith("image/")
                )
              : list;

          setPickerItems(filtered);
          setPickerSelectedId(filtered?.[0]?._id || null);
        }
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load items";
        toast.error(message);
        setPickerItems([]);
        setPickerSelectedId(null);
      } finally {
        setPickerLoading(false);
      }
    },
    [toast]
  );

  const openPicker = useCallback(
    async (toolId) => {
      setPickerTool(toolId);
      setPickerMode("existing");
      setCreateYouTubeUrl("");
      setCreateNoteTitle("");
      setCreateNoteContent("");
      setCreateTodoTitle("");
      setPickerOpen(true);
      await loadPickerItems(toolId);
    },
    [loadPickerItems]
  );

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

  const submitPicker = useCallback(async () => {
    const itemType = getPickerCollectionItemType();
    const itemId = pickerSelectedId;
    if (!itemType || !itemId) {
      toast.warning("Select an item first.");
      return;
    }

    const key = `${itemType}:${itemId}`;
    if (existingKeys.has(key)) {
      toast.info("That item is already in this collection.");
      setPickerOpen(false);
      return;
    }

    try {
      setIsToolBusy(true);
      await addCollectionItem(itemType, String(itemId));
      toast.success("Added to collection.");
      setPickerOpen(false);
      await load();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to add item to collection";
      toast.error(message);
    } finally {
      setIsToolBusy(false);
    }
  }, [
    addCollectionItem,
    existingKeys,
    getPickerCollectionItemType,
    load,
    pickerSelectedId,
    toast,
  ]);

  const uploadAndAddFiles = useCallback(
    async (fileList, acceptType) => {
      const files = Array.from(fileList || []);
      if (!files.length) return;

      try {
        setIsToolBusy(true);
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
        setPickerOpen(false);
        await load();
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to upload files";
        toast.error(message);
      } finally {
        setIsToolBusy(false);
      }
    },
    [addCollectionItem, load, toast]
  );

  const createAndAdd = useCallback(async () => {
    if (pickerTool === "file") {
      createFileInputRef.current?.click();
      return;
    }

    if (pickerTool === "photo") {
      createPhotoInputRef.current?.click();
      return;
    }

    try {
      setIsToolBusy(true);

      if (pickerTool === "youtube") {
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
        setPickerOpen(false);
        await load();
        return;
      }

      if (pickerTool === "note") {
        const title = createNoteTitle.trim();
        const content = createNoteContent.trim();
        if (!title && !content) {
          toast.warning("Write something first.");
          return;
        }

        const res = await stickyNotesAPI.create({
          title: title || "Untitled",
          content,
        });
        if (!res?.success) {
          throw new Error(res?.message || "Failed to create note");
        }
        const created = res.data;
        if (!created?._id) throw new Error("Note created but missing id");

        await addCollectionItem("sticky-note", String(created._id));
        toast.success("Note added.");
        setPickerOpen(false);
        await load();
        return;
      }

      if (pickerTool === "todo") {
        const title = createTodoTitle.trim();
        if (!title) {
          toast.warning("Enter a task title.");
          return;
        }

        const res = await todoAPI.create({ title, completed: false });
        if (!res?.success) {
          throw new Error(res?.message || "Failed to create task");
        }
        const created = res.data;
        if (!created?._id) throw new Error("Task created but missing id");

        await addCollectionItem("todo", String(created._id));
        toast.success("Task added.");
        setPickerOpen(false);
        await load();
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
      setIsToolBusy(false);
    }
  }, [
    addCollectionItem,
    createNoteContent,
    createNoteTitle,
    createTodoTitle,
    createYouTubeUrl,
    load,
    pickerTool,
    toast,
  ]);

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
      await load();
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to remove item";
      toast.error(message);
    } finally {
      setIsRemoving(false);
    }
  }, [collectionId, deleteCanvasItem, load, toast]);

  const handleSelectTool = useCallback(
    (toolId) => {
      setActiveTool(toolId);
      openPicker(toolId);
    },
    [openPicker]
  );

  if (!collectionId) return null;

  return (
    <div className="fixed inset-0 z-[70] dp-bg dp-text">
      <div className="h-full flex flex-col">
        <div className="shrink-0 dp-surface dp-border border-b px-4 py-3">
          <div className="flex items-center gap-3">
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
                  ? "Loading…"
                  : `${items.length} item${items.length === 1 ? "" : "s"}`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div
            ref={canvasSurfaceRef}
            className="relative dp-surface w-full h-full"
          >
            <BottomBar
              activeTool={activeTool}
              onSelectTool={handleSelectTool}
            />

            <Modal
              open={pickerOpen}
              onClose={() => {
                if (isToolBusy) return;
                setPickerOpen(false);
              }}
              title={pickerTitle}
              description={pickerDescription}
              footer={
                <div className="flex items-center justify-between gap-2">
                  {isCreateMode ? (
                    <button
                      type="button"
                      onClick={() => setPickerMode("existing")}
                      className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
                      disabled={isToolBusy}
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
                        setPickerMode((m) =>
                          m === "create" ? "existing" : "create"
                        )
                      }
                      className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
                      disabled={isToolBusy}
                    >
                      {isCreateMode ? "Pick existing" : "Create new"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPickerOpen(false)}
                      className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
                      disabled={isToolBusy}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={isCreateMode ? createAndAdd : submitPicker}
                      className="dp-btn-primary rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
                      disabled={
                        isToolBusy || (!isCreateMode && !pickerSelectedId)
                      }
                    >
                      {isToolBusy
                        ? "Working…"
                        : isCreateMode
                        ? pickerTool === "file"
                          ? "Upload & Add"
                          : pickerTool === "photo"
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
                    {pickerTool === "youtube" ? (
                      <input
                        value={createYouTubeUrl}
                        onChange={(e) => setCreateYouTubeUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=…"
                        className="dp-surface dp-border dp-text w-full rounded-xl border px-4 py-2 text-sm outline-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") createAndAdd();
                        }}
                        disabled={isToolBusy}
                      />
                    ) : null}

                    {pickerTool === "note" ? (
                      <div className="space-y-2">
                        <input
                          value={createNoteTitle}
                          onChange={(e) => setCreateNoteTitle(e.target.value)}
                          placeholder="Title"
                          className="dp-surface dp-border dp-text w-full rounded-xl border px-4 py-2 text-sm outline-none"
                          disabled={isToolBusy}
                        />
                        <textarea
                          value={createNoteContent}
                          onChange={(e) => setCreateNoteContent(e.target.value)}
                          placeholder="Write your note…"
                          className="dp-surface dp-border dp-text w-full min-h-[140px] resize-y rounded-xl border px-4 py-2 text-sm outline-none"
                          disabled={isToolBusy}
                        />
                      </div>
                    ) : null}

                    {pickerTool === "todo" ? (
                      <input
                        value={createTodoTitle}
                        onChange={(e) => setCreateTodoTitle(e.target.value)}
                        placeholder="Task title"
                        className="dp-surface dp-border dp-text w-full rounded-xl border px-4 py-2 text-sm outline-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") createAndAdd();
                        }}
                        disabled={isToolBusy}
                      />
                    ) : null}

                    {pickerTool === "file" || pickerTool === "photo" ? (
                      <div className="dp-surface-muted dp-border rounded-2xl border p-4">
                        <p className="dp-text font-semibold">Upload</p>
                        <p className="dp-text-muted mt-1 text-sm">
                          Choose {pickerTool === "photo" ? "images" : "files"}{" "}
                          to upload and add.
                        </p>
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={createAndAdd}
                            className="dp-btn-primary rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
                            disabled={isToolBusy}
                          >
                            {isToolBusy ? "Uploading…" : "Choose files"}
                          </button>
                        </div>

                        <input
                          ref={createFileInputRef}
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const fl = e.target.files;
                            e.target.value = "";
                            uploadAndAddFiles(fl, "file");
                          }}
                        />
                        <input
                          ref={createPhotoInputRef}
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const fl = e.target.files;
                            e.target.value = "";
                            uploadAndAddFiles(fl, "photo");
                          }}
                        />
                      </div>
                    ) : null}
                  </>
                ) : (
                  <>
                    <input
                      value={pickerSearch}
                      onChange={(e) => setPickerSearch(e.target.value)}
                      placeholder="Search…"
                      className="dp-surface dp-border dp-text w-full rounded-xl border px-4 py-2 text-sm outline-none"
                      disabled={pickerLoading}
                    />

                    {pickerLoading ? (
                      <div className="dp-text-muted text-sm">Loading…</div>
                    ) : pickerFiltered.length ? (
                      <div className="space-y-2">
                        {pickerFiltered.slice(0, 60).map((it) => {
                          const id = getPickerItemId(it);
                          if (!id) return null;
                          const { title: rowTitle, subtitle } =
                            getPickerItemLabel(it);
                          const itemType = getPickerCollectionItemType();
                          const key = itemType ? `${itemType}:${id}` : null;
                          const alreadyAdded = key
                            ? existingKeys.has(key)
                            : false;
                          const isActive =
                            String(pickerSelectedId || "") === String(id);

                          return (
                            <button
                              key={String(id)}
                              type="button"
                              onClick={() => setPickerSelectedId(id)}
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
                        {pickerFiltered.length > 60 ? (
                          <p className="dp-text-muted text-xs">
                            Showing 60 of {pickerFiltered.length}
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

            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="dp-surface dp-border rounded-2xl border px-4 py-3">
                  <p className="dp-text-soft text-sm font-medium">
                    Loading collection…
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
            ) : (
              items
                .map((it) => ({ key: getItemKey(it), item: it }))
                .filter((x) => x.key)
                .map(({ key, item }) => (
                  <ResizableItemCard
                    key={key}
                    item={item}
                    containerRef={canvasSurfaceRef}
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
            )}

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
