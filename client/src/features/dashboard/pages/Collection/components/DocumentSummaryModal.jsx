import { useMemo, useRef, useState } from "react";
import { FileText, Loader2, Upload } from "@/shared/ui/icons/icons";
import Modal from "../../../../../shared/ui/modals/Modal";

export default function DocumentSummaryModal({ open, busy, onClose, onSubmit }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const dropZoneClassName = useMemo(() => {
    const base = "border-hairline rounded-xl border-2 border-dashed p-6 transition-all duration-200 cursor-pointer bg-canvas/30 text-ink";
    if (busy) return `${base} opacity-70 cursor-not-allowed`;
    if (dragActive) return `${base} border-primary bg-primary/5 scale-[0.99]`;
    return `${base} hover:border-primary/60`;
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
            className="bg-transparent hover:bg-hairline-soft border border-hairline text-ink rounded-full px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
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
          <span className="text-ink text-sm font-semibold">
            {busy ? "Summarizing..." : "Drop PDF here or click to upload"}
          </span>
          <FileText size={14} className="text-muted-soft ml-auto" />
        </div>
        <p className="text-muted mt-2 text-xs">Only `.pdf` files are supported.</p>
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
