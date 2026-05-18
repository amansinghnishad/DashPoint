import { useMemo, useRef, useState } from "react";

import { FileText, Loader2, Upload } from "@/shared/ui/icons/icons";

import Modal from "../../../../../shared/ui/modals/Modal";

export default function DocumentSummaryModal({ open, busy, onClose, onSubmit }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const dropZoneClassName = useMemo(() => {
    const base = "dp-border rounded-xl border-2 border-dashed p-4 transition-colors cursor-pointer";
    if (busy) return `${base} opacity-70 cursor-not-allowed`;
    if (dragActive) return `${base} border-blue-500 bg-blue-50/40`;
    return `${base} hover:border-blue-400`;
  }, [busy, dragActive]);

  const handleFile = (file) => {
    if (!file || busy) return;
    onSubmit?.(file);
  };

  const onDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    if (busy) return;

    const file = event.dataTransfer?.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      disableClose={busy}
      title="Summarize Document"
      description="Upload a PDF and save a Gemini summary as a note in this collection."
      size="sm"
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
          >
            Close
          </button>
        </div>
      }
    >
      <div
        role="button"
        tabIndex={0}
        className={dropZoneClassName}
        onDragEnter={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!busy) setDragActive(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!busy) setDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setDragActive(false);
        }}
        onDrop={onDrop}
        onClick={() => {
          if (busy) return;
          inputRef.current?.click();
        }}
        onKeyDown={(event) => {
          if (busy) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        aria-label="Upload PDF for summarization"
      >
        <div className="flex items-center gap-2">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          <span className="dp-text text-sm font-medium">
            {busy ? "Summarizing..." : "Drop PDF here or click to upload"}
          </span>
          <FileText size={14} className="dp-text-muted ml-auto" />
        </div>
        <p className="dp-text-muted mt-2 text-xs">Only `.pdf` files are supported.</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          handleFile(file);
        }}
      />
    </Modal>
  );
}
