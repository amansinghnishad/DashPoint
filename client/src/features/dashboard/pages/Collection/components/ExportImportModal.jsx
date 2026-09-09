import { Download, FileJson, FileText, Upload, Sparkles } from "lucide-react";
import { useRef, useState } from "react";

import Modal from "../../../../../shared/ui/modals/Modal";
import {
  exportCollectionToMarkdown,
  exportCollectionToJson,
  parseImportedData,
} from "../utils/collectionExportUtils";

export default function ExportImportModal({
  open,
  onClose,
  collection,
  items = [],
  layouts = {},
  onImportData,
}) {
  const [activeTab, setActiveTab] = useState("export");
  const [importPreview, setImportPreview] = useState(null);
  const [importError, setImportError] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  const handleExportMarkdown = () => {
    exportCollectionToMarkdown(collection, items);
  };

  const handleExportJson = () => {
    exportCollectionToJson(collection, items, layouts);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        const fileType = file.name.endsWith(".json") ? "json" : "markdown";
        const parsed = parseImportedData(text, fileType);
        setImportPreview({ ...parsed, fileName: file.name });
      } catch (err) {
        setImportError(err.message || "Failed to read import file");
        setImportPreview(null);
      }
    };

    reader.onerror = () => {
      setImportError("Error reading file");
      setImportPreview(null);
    };

    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (!importPreview || isImporting) return;
    try {
      setIsImporting(true);
      await onImportData?.(importPreview);
      onClose();
    } catch (err) {
      setImportError(err.message || "Failed to import data");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!isImporting) onClose();
      }}
      title="Export & Import"
      description="Backup your workspace or import notes and collections."
      size="md"
    >
      <div className="space-y-4 pt-1">
        {/* Tab Switcher */}
        <div className="flex rounded-full border border-hairline bg-canvas-soft p-1">
          <button
            type="button"
            onClick={() => setActiveTab("export")}
            className={`flex-1 rounded-full py-1.5 text-xs font-bold transition-all ${
              activeTab === "export"
                ? "bg-surface-card text-ink shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            Export Collection
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("import")}
            className={`flex-1 rounded-full py-1.5 text-xs font-bold transition-all ${
              activeTab === "import"
                ? "bg-surface-card text-ink shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            Import File
          </button>
        </div>

        {activeTab === "export" ? (
          <div className="grid gap-3 pt-2">
            <div className="flex items-center justify-between rounded-2xl border border-hairline bg-surface-card p-4 transition-colors hover:bg-canvas-soft/40">
              <div className="flex items-center gap-3 min-w-0 pr-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-ink">Markdown Document (.md)</p>
                  <p className="text-[11px] text-muted-soft truncate">
                    Compatible with Obsidian, Notion, and GitHub flavored markdown.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleExportMarkdown}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary hover:bg-primary-active text-canvas px-4 py-2 text-xs font-semibold shrink-0 shadow-sm transition-all"
              >
                <Download size={14} />
                Download
              </button>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-hairline bg-surface-card p-4 transition-colors hover:bg-canvas-soft/40">
              <div className="flex items-center gap-3 min-w-0 pr-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
                  <FileJson size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-ink">Complete JSON Backup (.json)</p>
                  <p className="text-[11px] text-muted-soft truncate">
                    Preserves spatial card coordinates, widget configurations, and metadata.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleExportJson}
                className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface-card hover:bg-canvas-soft px-4 py-2 text-xs font-semibold text-ink shrink-0 shadow-sm transition-all"
              >
                <Download size={14} />
                Download
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown,.json"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!importPreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-hairline p-8 text-center transition-colors hover:border-primary/50 hover:bg-canvas-soft/30"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-canvas-soft border border-hairline text-muted mb-3">
                  <Upload size={22} />
                </div>
                <p className="text-xs font-bold text-ink">Choose a Markdown or JSON file</p>
                <p className="text-[11px] text-muted-soft mt-1">
                  Supports .md, .markdown, and .json backup files
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-hairline bg-surface-card p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-hairline pb-3">
                  <div>
                    <p className="text-xs font-bold text-ink">{importPreview.fileName}</p>
                    <p className="text-[11px] text-muted-soft uppercase font-semibold mt-0.5">
                      Type: {importPreview.type}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImportPreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-xs font-semibold text-muted hover:text-ink"
                  >
                    Change file
                  </button>
                </div>

                {importPreview.type === "markdown" ? (
                  <div className="text-xs text-muted space-y-1">
                    <p><span className="font-semibold text-ink">Title:</span> {importPreview.title}</p>
                    <p><span className="font-semibold text-ink">Tasks found:</span> {importPreview.tasks?.length || 0}</p>
                    {importPreview.notes ? (
                      <p className="line-clamp-2 text-muted-soft italic">{importPreview.notes}</p>
                    ) : null}
                  </div>
                ) : (
                  <div className="text-xs text-muted space-y-1">
                    <p><span className="font-semibold text-ink">Collection:</span> {importPreview.collection?.name || "Backup"}</p>
                    <p><span className="font-semibold text-ink">Items count:</span> {importPreview.items?.length || 0}</p>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleExecuteImport}
                    disabled={isImporting}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary hover:bg-primary-active text-canvas px-5 py-2 text-xs font-semibold shadow-sm transition-all disabled:opacity-40"
                  >
                    <Sparkles size={14} />
                    {isImporting ? "Importing..." : "Import to Canvas"}
                  </button>
                </div>
              </div>
            )}

            {importError ? (
              <p className="text-xs font-medium text-rose-500">{importError}</p>
            ) : null}
          </div>
        )}
      </div>
    </Modal>
  );
}
