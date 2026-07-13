import {
  ArrowLeft,
  FileText,
  Image,
  FileCode,
  File,
  Sparkles,
  Plus,
  Trash2,
  Download,
  FolderOpen,
  ArrowRight,
  Loader2,
  Globe,
  Link,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";

import { FILE_MANAGER_ACCEPT } from "./fileManager/fileManager.helpers";
import FileSummarizeToCollectionModal from "./fileManager/FileSummarizeToCollectionModal";
import { useFileManager } from "./fileManager/useFileManager";
import { useToast } from "../../../hooks/useToast";
import fileService from "../../../services/modules/fileService";
import Clock from "../../../shared/ui/Clock/Clock";
import AddToCollectionModal from "../../../shared/ui/modals/AddToCollectionModal";
import ContentInsightReviewModal from "../../../shared/ui/modals/ContentInsightReviewModal";
import DeleteConfirmModal from "../../../shared/ui/modals/DeleteConfirmModal";
import Modal from "../../../shared/ui/modals/Modal";

export default function FileManagerPage({ triggerRef, searchTriggerRef }) {
  const toast = useToast();
  const {
    state: {
      search,
      items,
      selected,
      selectedId,
      textPreview,
      isBusy,
      addToCollectionItem,
      deleteItem,
      isDeleting,
      insightQueue,
    },
    actions: {
      setSearch,
      setSelectedId,
      setAddToCollectionItem,
      setDeleteItem,
      uploadSelectedFiles,
      removeFile,
      downloadSelectedFile,
      setInsightQueue,
      addWebLink,
    },
  } = useFileManager();

  const fileInputRef = useRef(null);
  const [summarizeItem, setSummarizeItem] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");
  const activeInsight = insightQueue[0] || null;

  // Add Document unified modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addTab, setAddTab] = useState("file"); // "file" | "link"

  // Web link form states
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkDesc, setLinkDesc] = useState("");
  const [linkTags, setLinkTags] = useState("");
  const [isSubmittingLink, setIsSubmittingLink] = useState(false);

  const closeActiveInsight = () => {
    setInsightQueue((current) => current.slice(1));
  };

  // Bind the header upload button trigger to open the unified modal
  useEffect(() => {
    if (triggerRef) {
      triggerRef.current = () => {
        setAddTab("file");
        setAddModalOpen(true);
      };
    }
    return () => {
      if (triggerRef) triggerRef.current = null;
    };
  }, [triggerRef]);

  // Bind the header search bar filter
  useEffect(() => {
    if (searchTriggerRef) {
      searchTriggerRef.current = (query) => setSearch(query);
    }
    return () => {
      if (searchTriggerRef) searchTriggerRef.current = null;
    };
  }, [searchTriggerRef, setSearch]);

  useEffect(() => {
    const isPdfSelected =
      selected?.type === "file" && String(selected?.mime || "").toLowerCase() === "application/pdf";

    if (!isPdfSelected || !selected?.id) {
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
        const blob = await fileService.getFilePreviewBlob(selected.id);
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
          toast.error("Failed to load PDF preview.");
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
  }, [selected?.id, selected?.mime, selected?.type, toast]);

  const onPickFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    setAddModalOpen(false);
    await uploadSelectedFiles(files);
  };

  const handleLinkSubmit = async (e) => {
    e.preventDefault();
    if (!linkUrl.trim()) {
      toast.warning("Please enter a website URL.");
      return;
    }

    setIsSubmittingLink(true);
    const success = await addWebLink({
      url: linkUrl,
      title: linkTitle,
      description: linkDesc,
      tags: linkTags,
    });
    setIsSubmittingLink(false);

    if (success) {
      setLinkUrl("");
      setLinkTitle("");
      setLinkDesc("");
      setLinkTags("");
      setAddModalOpen(false);
    }
  };

  const getFileIcon = (mime) => {
    const m = String(mime || "").toLowerCase();
    if (m === "text/html") return <Globe size={18} className="text-emerald-500" />;
    if (m.includes("pdf")) return <FileText size={18} className="text-red-500" />;
    if (m.startsWith("image/")) return <Image size={18} className="text-blue-500" />;
    if (m.includes("javascript") || m.includes("json") || m.includes("html") || m.includes("css")) {
      return <FileCode size={18} className="text-amber-500" />;
    }
    return <File size={18} className="text-muted" />;
  };

  const getFileTypeLabel = (mime) => {
    const m = String(mime || "").toLowerCase();
    if (m === "text/html") return "Web Link";
    if (m.includes("pdf")) return "PDF Document";
    if (m.startsWith("image/")) return "Image Asset";
    if (m.includes("javascript") || m.includes("json")) return "JSON/Code File";
    return "Attachment";
  };

  const handleDownload = async (it) => {
    if (it.mime === "text/html") {
      window.open(it.remoteUrl, "_blank");
      return;
    }
    try {
      await fileService.downloadFile(it.id, it.title || "download");
    } catch {
      toast.error("Failed to download file");
    }
  };

  // Local filter fallback
  const filteredItems = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.title.toLowerCase().includes(q));
  }, [items, search]);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={onPickFiles}
        accept={FILE_MANAGER_ACCEPT}
      />

      <div className="w-full max-w-[1024px] mx-auto py-4 relative">
        {/* Full-width Preview/Viewer Mode */}
        {selectedId && selected ? (
          <div className="w-full">
            <button
              onClick={() => setSelectedId(null)}
              className="flex items-center gap-2 text-ink hover:opacity-80 mb-6 font-semibold text-sm transition-opacity"
            >
              <ArrowLeft size={16} />
              <span>Back to Files</span>
            </button>

            <div className="bg-surface-card border border-hairline rounded-2xl overflow-hidden shadow-sm p-6">
              <div className="flex items-start justify-between gap-4 mb-6 border-b border-hairline/60 pb-4">
                <div className="min-w-0">
                  <h3 className="font-waldenburg-light text-2xl text-ink font-bold leading-tight">{selected.title}</h3>
                  <p className="text-muted text-xs font-semibold mt-1">{selected.subtitle || getFileTypeLabel(selected.mime)}</p>
                </div>
                <button
                  type="button"
                  onClick={downloadSelectedFile}
                  className="bg-primary hover:bg-primary-active text-canvas rounded-full px-5 py-2 text-xs font-bold transition-all h-9 flex items-center justify-center gap-1.5 shadow-sm shrink-0"
                >
                  {selected.mime === "text/html" ? <Globe size={14} /> : <Download size={14} />}
                  <span>{selected.mime === "text/html" ? "Open Website" : "Download"}</span>
                </button>
              </div>

              {/* Rendering previews */}
              {selected.mime === "text/html" ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between bg-canvas-soft border border-hairline rounded-xl px-4 py-3 select-none">
                    <span className="text-ink text-xs font-bold">Web Page Preview</span>
                    <a
                      href={selected.remoteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs font-bold flex items-center gap-1"
                    >
                      <span>Open in new tab</span>
                      <ArrowRight size={14} />
                    </a>
                  </div>
                  <iframe
                    title={selected.title}
                    className="h-[520px] w-full border border-hairline rounded-xl bg-white shadow-inner"
                    src={selected.remoteUrl}
                    sandbox="allow-scripts allow-same-origin allow-popups"
                  />
                </div>
              ) : selected.mime?.startsWith("image/") && selected.remoteUrl ? (
                <div className="flex justify-center bg-canvas-soft border border-hairline rounded-xl p-4 overflow-hidden">
                  <img
                    src={selected.remoteUrl}
                    alt={selected.title}
                    className="max-h-[520px] object-contain rounded-lg"
                  />
                </div>
              ) : selected.mime === "application/pdf" ? (
                pdfPreviewUrl ? (
                  <iframe
                    title={selected.title}
                    className="h-[520px] w-full border border-hairline rounded-xl"
                    src={pdfPreviewUrl}
                  />
                ) : (
                  <div className="border border-hairline bg-canvas-soft rounded-xl p-8 text-center flex flex-col items-center justify-center">
                    <Loader2 size={24} className="animate-spin text-muted mb-2" />
                    <p className="text-ink font-semibold text-sm">Loading PDF preview...</p>
                  </div>
                )
              ) : textPreview != null ? (
                <pre className="border border-hairline bg-canvas-soft text-ink max-h-[520px] overflow-auto rounded-xl p-5 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                  {textPreview}
                </pre>
              ) : (
                <div className="border border-hairline bg-canvas-soft rounded-xl p-8 text-center">
                  <p className="text-ink font-semibold text-sm">Preview not available</p>
                  <p className="text-muted mt-1 text-xs">This file type can't be previewed directly in browser.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Table Listing Mode */
          <div>
            {/* Breadcrumbs & Title */}
            <div className="text-[12px] text-muted-soft tracking-wider flex items-center gap-1.5 font-medium mb-3 select-none">
              <span className="opacity-70">INTELLIGENCE LAYER</span>
              <span className="opacity-30">/</span>
              <span className="opacity-70 font-semibold text-ink">DOCUMENTS</span>
            </div>

            <div className="mb-8 min-w-0">
              <h2 className="font-waldenburg-light text-5xl text-ink leading-tight select-none">
                File Manager
              </h2>
            </div>

            {/* Ingestion status/busy indicator */}
            {isBusy && (
              <div className="bg-surface-card border border-hairline rounded-2xl p-4 shadow-sm mb-6 flex items-center gap-3 animate-pulse">
                <Loader2 size={16} className="animate-spin text-primary" />
                <span className="text-ink text-xs font-semibold">Processing document ingestion...</span>
              </div>
            )}

            {/* Document Table */}
            {!filteredItems.length ? (
              <div className="border border-hairline bg-surface-card rounded-2xl p-8 text-center select-none">
                <FolderOpen size={40} className="mx-auto text-muted-soft" />
                <p className="mt-4 text-ink font-bold text-base">No files uploaded yet</p>
                <p className="mt-1 text-muted text-sm">
                  Click "+ Add Document" in the header to ingest your documents or paste web links.
                </p>
              </div>
            ) : (
              <div className="border border-hairline bg-surface-card rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-hairline bg-canvas/30 text-[11px] font-bold text-muted-soft uppercase tracking-wider select-none">
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4 hidden md:table-cell">Type</th>
                      <th className="px-6 py-4 hidden sm:table-cell">Size</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline/60 text-sm">
                    {filteredItems.map((it) => {
                      const canSummarizePdf = String(it.mime || "").toLowerCase().includes("pdf");
                      return (
                        <tr key={it.id} className="hover:bg-canvas-soft/80 transition-colors group">
                          {/* File details */}
                          <td className="px-6 py-3.5 min-w-0">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-canvas-soft border border-hairline/60 flex items-center justify-center text-ink shrink-0">
                                {getFileIcon(it.mime)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <button
                                  onClick={() => setSelectedId(it.id)}
                                  className="font-bold text-ink hover:underline truncate block text-left"
                                >
                                  {it.title}
                                </button>
                                <p className="text-[10px] text-muted-soft sm:hidden mt-0.5">{it.subtitle || "Web Page"}</p>
                              </div>
                            </div>
                          </td>

                          {/* File type */}
                          <td className="px-6 py-3.5 hidden md:table-cell text-muted-soft font-medium select-none">
                            {getFileTypeLabel(it.mime)}
                          </td>

                          {/* File size */}
                          <td className="px-6 py-3.5 hidden sm:table-cell text-muted-soft font-medium select-none">
                            {it.subtitle || "—"}
                          </td>

                          <td className="px-6 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5 transition-opacity duration-200 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                              {canSummarizePdf && (
                                <button
                                  type="button"
                                  onClick={() => setSummarizeItem(it)}
                                  className="text-muted hover:text-ink p-1 rounded-lg hover:bg-canvas-soft transition-colors"
                                  title="Summarize PDF"
                                >
                                  <Sparkles size={15} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setAddToCollectionItem(it)}
                                className="text-muted hover:text-ink p-1 rounded-lg hover:bg-canvas-soft transition-colors"
                                title="Add to Album"
                              >
                                <Plus size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownload(it)}
                                className="text-muted hover:text-ink p-1 rounded-lg hover:bg-canvas-soft transition-colors"
                                title={it.mime === "text/html" ? "Open Website" : "Download File"}
                              >
                                {it.mime === "text/html" ? <Globe size={15} /> : <Download size={15} />}
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteItem(it)}
                                className="text-muted hover:text-semantic-error p-1 rounded-lg hover:bg-canvas-soft transition-colors"
                                title="Delete File"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Unified Add Document Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Document / Link"
        description="Ingest local PDF/Image files or paste website URLs to save in your library."
        size="sm"
      >
        <div className="space-y-5">
          {/* Tab selector */}
          <div className="flex border border-hairline rounded-full overflow-hidden p-0.5 bg-canvas-soft select-none">
            <button
              onClick={() => setAddTab("file")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${addTab === "file" ? "bg-surface-card text-ink shadow-sm" : "text-muted hover:text-ink"
                }`}
            >
              Upload Local File
            </button>
            <button
              onClick={() => setAddTab("link")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${addTab === "link" ? "bg-surface-card text-ink shadow-sm" : "text-muted hover:text-ink"
                }`}
            >
              Paste Web Link
            </button>
          </div>

          {addTab === "file" ? (
            /* Upload Local File Tab */
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-hairline hover:border-primary/60 rounded-xl p-8 text-center cursor-pointer bg-canvas/30 hover:bg-canvas-soft/30 transition-all flex flex-col items-center justify-center select-none"
              >
                <Upload size={24} className="text-muted-soft mb-2.5" />
                <p className="text-ink text-sm font-semibold">Select files to upload</p>
                <p className="text-muted mt-1 text-xs">PDF, Image, Text, Markdown, JSON, CSV</p>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="bg-transparent hover:bg-hairline-soft border border-hairline text-ink rounded-full px-5 py-2 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Paste Web Link Tab */
            <form onSubmit={handleLinkSubmit} className="space-y-4">
              <div className="space-y-3.5">
                <div>
                  <label htmlFor="web-link-url" className="text-xs font-bold text-ink uppercase tracking-wider block mb-1.5">
                    Website URL *
                  </label>
                  <input
                    id="web-link-url"
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="border border-hairline bg-canvas-soft text-ink w-full rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/20"
                    placeholder="e.g. https://dashpoint.ai"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="web-link-title" className="text-xs font-bold text-ink uppercase tracking-wider block mb-1.5">
                    Custom Title (Optional)
                  </label>
                  <input
                    id="web-link-title"
                    type="text"
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                    className="border border-hairline bg-canvas-soft text-ink w-full rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/20"
                    placeholder="e.g. Dashpoint Website"
                  />
                </div>

                <div>
                  <label htmlFor="web-link-desc" className="text-xs font-bold text-ink uppercase tracking-wider block mb-1.5">
                    Description (Optional)
                  </label>
                  <textarea
                    id="web-link-desc"
                    value={linkDesc}
                    onChange={(e) => setLinkDesc(e.target.value)}
                    className="border border-hairline bg-canvas-soft text-ink w-full rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/20 resize-none h-16"
                    placeholder="Briefly describe what this webpage is..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-hairline/60 pt-4">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="bg-transparent hover:bg-hairline-soft border border-hairline text-ink rounded-full px-5 py-2 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLink || !linkUrl.trim()}
                  className="bg-primary hover:bg-primary-active text-canvas rounded-full px-5 py-2 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  {isSubmittingLink && <Loader2 size={13} className="animate-spin" />}
                  <span>Save Link</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* Collection Modal */}
      <AddToCollectionModal
        open={Boolean(addToCollectionItem)}
        onClose={() => setAddToCollectionItem(null)}
        itemType="file"
        itemId={addToCollectionItem?.id || null}
        itemTitle={addToCollectionItem?.title || null}
      />

      {/* Delete Modal */}
      <DeleteConfirmModal
        open={Boolean(deleteItem)}
        onClose={() => {
          if (isDeleting) return;
          setDeleteItem(null);
        }}
        onConfirm={removeFile}
        title={deleteItem?.title ? `Delete: ${deleteItem.title}` : "Delete file"}
        description="Delete this file?"
        busy={isDeleting}
      />

      {/* Summary Modal */}
      <FileSummarizeToCollectionModal
        open={Boolean(summarizeItem)}
        onClose={() => setSummarizeItem(null)}
        fileItem={summarizeItem}
      />

      {/* Insight review modal */}
      <ContentInsightReviewModal
        open={Boolean(activeInsight)}
        insight={activeInsight}
        onClose={closeActiveInsight}
        onAccepted={() => {
          toast.success("Action items saved.");
        }}
        onRejected={() => {
          toast.info("AI suggestions dismissed.");
        }}
      />
    </>
  );
}
