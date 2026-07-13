import { useEffect, useState } from "react";
import {
  FileText,
  Image,
  Trash2,
  Edit2,
  LayoutGrid,
  Move,
  Youtube,
} from "lucide-react";

import PlannerWidgetBody from "./plannerWidgets/PlannerWidgetBody";
import { useResizableCard } from "./useResizableCard";
import fileService from "../../../../../services/modules/fileService";
import { SERVER_BASE_URL } from "../../../../../shared/config/appConfig";
import { extractYouTubeId } from "../../../../../shared/lib/urlUtils";

const getTitleForItem = (item) => {
  const data = item?.itemData;
  if (!data || typeof data !== "object") return "Item";

  return (
    data.title ||
    data.name ||
    data.originalName ||
    data.filename ||
    data.url ||
    data.videoTitle ||
    "Item"
  );
};

const getTypeIcon = (itemType) => {
  switch (itemType) {
    case "youtube":
      return Youtube;
    case "file":
      return FileText;
    case "photo":
      return Image;
    case "planner":
      return LayoutGrid;
    default:
      return FileText;
  }
};

const getYouTubeEmbedSrc = (data) => {
  if (!data || typeof data !== "object") return null;

  // Prefer the server-provided embedUrl.
  if (typeof data.embedUrl === "string" && data.embedUrl.trim()) {
    return data.embedUrl.trim();
  }

  // Fall back to url/videoId if embedUrl isn't present.
  const videoId =
    (typeof data.videoId === "string" && data.videoId.trim()) ||
    extractYouTubeId(String(data.url || ""));

  if (!videoId) return null;

  // Privacy-enhanced mode.
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
};

const resolveFileUrl = (value) => {
  const url = String(value || "").trim();
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${SERVER_BASE_URL}${url}`;
};

const getFileDownloadUrl = (data) => {
  const id = String(data?._id || "").trim();
  if (!id) return "";
  return `${SERVER_BASE_URL}/api/files/${id}/download`;
};

const isImageFile = (data) =>
  String(data?.mimetype || "")
    .toLowerCase()
    .startsWith("image/");

const isPdfFile = (data) => {
  const mimetype = String(data?.mimetype || "").toLowerCase();
  const originalName = String(data?.originalName || data?.filename || "")
    .toLowerCase()
    .trim();
  return mimetype === "application/pdf" || originalName.endsWith(".pdf");
};

export default function ResizableItemCard({
  item,
  layout,
  onLayoutChange,
  containerRef,
  viewportScale,
  onEdit,
  onDelete,
}) {
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");

  // When the canvas is zoomed (Ctrl+wheel), drag/resize deltas must be scaled back
  // into world coordinates.
  // Default to 1 to preserve existing behavior.
  const effectiveScale = typeof viewportScale === "number" && viewportScale > 0 ? viewportScale : 1;

  const resizable = useResizableCard({
    layout,
    onLayoutChange,
    containerRef,
    viewportScale: effectiveScale,
    constrainToContainer: false,
  });

  const { currentLayout, isDragging, isResizing, handleDragStart, handleResizeStart } = resizable;

  const title = getTitleForItem(item);
  const type = item?.itemType || "item";
  const Icon = getTypeIcon(type);

  const youtubeEmbedSrc = type === "youtube" ? getYouTubeEmbedSrc(item?.itemData) : null;
  const fileUrl = resolveFileUrl(item?.itemData?.url);
  const fileId = String(item?.itemData?._id || "").trim();
  const fileDownloadUrl = getFileDownloadUrl(item?.itemData);
  const shouldLoadPdfPreview =
    (type === "file" || type === "photo") && isPdfFile(item?.itemData) && Boolean(fileId);

  useEffect(() => {
    if (!shouldLoadPdfPreview) {
      setPdfPreviewUrl((previous) => {
        if (previous) {
          window.URL.revokeObjectURL(previous);
        }
        return "";
      });
      return undefined;
    }

    let isDisposed = false;
    let objectUrl = "";

    const loadPdfPreview = async () => {
      try {
        const blob = await fileService.getFilePreviewBlob(fileId);
        objectUrl = window.URL.createObjectURL(blob);

        if (isDisposed) {
          window.URL.revokeObjectURL(objectUrl);
          return;
        }

        setPdfPreviewUrl((previous) => {
          if (previous) {
            window.URL.revokeObjectURL(previous);
          }
          return objectUrl;
        });
      } catch {
        if (!isDisposed) {
          setPdfPreviewUrl((previous) => {
            if (previous) {
              window.URL.revokeObjectURL(previous);
            }
            return "";
          });
        }
      }
    };

    loadPdfPreview();

    return () => {
      isDisposed = true;
      if (objectUrl) {
        window.URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fileId, shouldLoadPdfPreview]);

  const bodyClassName =
    type === "youtube" || type === "file" || type === "photo"
      ? "flex-1 min-h-0 overflow-hidden touch-auto"
      : "flex-1 min-h-0 overflow-auto touch-auto";

  return (
    <div
      className={`group absolute bg-surface-card border border-hairline rounded-2xl shadow-md overflow-hidden flex flex-col ${
        isDragging || isResizing ? "shadow-2xl border-primary" : ""
      }`}
      style={{
        left: currentLayout.x,
        top: currentLayout.y,
        width: currentLayout.width,
        height: currentLayout.height,
        minWidth: 280,
        minHeight: 200,
      }}
    >
      <div
        className="bg-canvas border-b border-hairline px-3.5 py-2 flex items-center justify-between cursor-move select-none touch-none"
        onPointerDown={handleDragStart}
        title="Drag to move"
      >
        <div className="min-w-0 flex items-center gap-2">
          <Icon size={15} className="text-muted shrink-0" />
          <p className="text-ink text-xs font-bold truncate">{title}</p>
        </div>
        <div className="text-muted flex items-center gap-1.5 text-xs whitespace-nowrap">
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(item);
            }}
            className="text-muted hover:text-ink hover:bg-canvas-soft inline-flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
            aria-label="Edit item"
            title="Edit"
          >
            <Edit2 size={13} />
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(item);
            }}
            className="text-muted hover:text-ink hover:bg-canvas-soft inline-flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
            aria-label="Delete item"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>

          <span className="mx-1 hidden sm:inline text-[10px] font-bold uppercase tracking-wider text-muted-soft">{type}</span>
          <Move size={13} className="text-muted-soft" />
        </div>
      </div>

      <div className={bodyClassName}>
        <div className="p-3.5 h-full">
          {type === "planner" ? (
            <PlannerWidgetBody widget={item?.itemData} />
          ) : type === "youtube" ? (
            <div className="h-full w-full border border-hairline rounded-xl overflow-hidden bg-black">
              {youtubeEmbedSrc ? (
                <iframe
                  className="h-full w-full"
                  src={youtubeEmbedSrc}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : null}
            </div>
          ) : type === "file" || type === "photo" ? (
            <div className="h-full w-full border border-hairline rounded-xl overflow-hidden flex flex-col bg-canvas-soft">
              <div className="flex-1 min-h-0 relative">
                {isImageFile(item?.itemData) && fileUrl ? (
                  <img
                    src={fileUrl}
                    alt={title}
                    className="h-full w-full object-contain bg-surface-card"
                  />
                ) : isPdfFile(item?.itemData) ? (
                  <object
                    data={pdfPreviewUrl || undefined}
                    type="application/pdf"
                    className="h-full w-full bg-surface-card"
                  >
                    <div className="h-full w-full p-4 flex flex-col justify-center text-center">
                      <p className="text-ink text-xs font-semibold">
                        {pdfPreviewUrl
                          ? "PDF preview is not available in this browser."
                          : "Loading PDF preview..."}
                      </p>
                      {fileUrl ? (
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary text-xs underline mt-2 font-semibold"
                        >
                          Open PDF
                        </a>
                      ) : null}
                    </div>
                  </object>
                ) : (
                  <div className="h-full w-full p-4 flex flex-col justify-center text-center">
                    <p className="text-ink text-xs font-bold">Preview not available</p>
                    <p className="text-muted text-[11px] mt-1">
                      Open or download this file to view it.
                    </p>
                  </div>
                )}
              </div>

              {fileDownloadUrl ? (
                <div className="bg-surface-card border-t border-hairline px-3 py-2 shrink-0">
                  <a
                    href={fileDownloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary text-xs font-bold hover:underline"
                  >
                    Open / Download
                  </a>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="h-full" />
          )}
        </div>
      </div>

      {/* Resize handles (sides + corners) */}
      <div className="pointer-events-none absolute inset-0">
        {/* Sides */}
        <div
          role="presentation"
          onPointerDown={(e) => handleResizeStart(e, "n")}
          className="pointer-events-auto absolute left-8 right-8 top-0 h-2 cursor-n-resize opacity-0 group-hover:opacity-100 transition-opacity touch-none"
          title="Resize"
        />
        <div
          role="presentation"
          onPointerDown={(e) => handleResizeStart(e, "s")}
          className="pointer-events-auto absolute left-8 right-8 bottom-0 h-2 cursor-s-resize opacity-0 group-hover:opacity-100 transition-opacity touch-none"
          title="Resize"
        />
        <div
          role="presentation"
          onPointerDown={(e) => handleResizeStart(e, "w")}
          className="pointer-events-auto absolute top-8 bottom-8 left-0 w-2 cursor-w-resize opacity-0 group-hover:opacity-100 transition-opacity touch-none"
          title="Resize"
        />
        <div
          role="presentation"
          onPointerDown={(e) => handleResizeStart(e, "e")}
          className="pointer-events-auto absolute top-8 bottom-8 right-0 w-2 cursor-e-resize opacity-0 group-hover:opacity-100 transition-opacity touch-none"
          title="Resize"
        />

        {/* Corners (small visible grab area on hover) */}
        <div
          role="presentation"
          onPointerDown={(e) => handleResizeStart(e, "nw")}
          className="pointer-events-auto absolute left-0 top-0 h-5 w-5 sm:left-1 sm:top-1 sm:h-3 sm:w-3 cursor-nw-resize rounded-md sm:rounded-sm hover:bg-canvas-soft opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-none"
          title="Resize"
        />
        <div
          role="presentation"
          onPointerDown={(e) => handleResizeStart(e, "ne")}
          className="pointer-events-auto absolute right-0 top-0 h-5 w-5 sm:right-1 sm:top-1 sm:h-3 sm:w-3 cursor-ne-resize rounded-md sm:rounded-sm hover:bg-canvas-soft opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-none"
          title="Resize"
        />
        <div
          role="presentation"
          onPointerDown={(e) => handleResizeStart(e, "sw")}
          className="pointer-events-auto absolute left-0 bottom-0 h-5 w-5 sm:left-1 sm:bottom-1 sm:h-3 sm:w-3 cursor-sw-resize rounded-md sm:rounded-sm hover:bg-canvas-soft opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-none"
          title="Resize"
        />
        <div
          role="presentation"
          onPointerDown={(e) => handleResizeStart(e, "se")}
          className="pointer-events-auto absolute right-0 bottom-0 h-5 w-5 sm:right-1 sm:bottom-1 sm:h-3 sm:w-3 cursor-se-resize rounded-md sm:rounded-sm hover:bg-canvas-soft opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-none"
          title="Resize"
        />
      </div>
    </div>
  );
}
