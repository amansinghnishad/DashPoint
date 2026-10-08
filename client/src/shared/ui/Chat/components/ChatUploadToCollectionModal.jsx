import { useEffect, useMemo, useRef, useState } from "react";

import {
  FILE_MANAGER_ACCEPT,
  getUploadValidationMessage,
} from "../../../../features/dashboard/pages/fileManager/fileManager.helpers";
import { useToast } from "../../../../hooks/useToast";
import { collectionsAPI } from "../../../../services/modules/collectionsApi";
import fileService from "../../../../services/modules/fileService";
import { DASHPOINT_COLLECTIONS_CHANGED_EVENT } from "../../../lib/dashboardEvents";
import Modal from "../../modals/Modal";

export default function ChatUploadToCollectionModal({ open, collections = [], onClose }) {
  const toast = useToast();
  const inputRef = useRef(null);
  const [collectionId, setCollectionId] = useState("");
  const [files, setFiles] = useState([]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const collectionOptions = useMemo(() => collections
    .map((collection) => ({
      id: String(collection?._id || collection?.id || ""),
      name: collection?.name || "Untitled collection",
    }))
    .filter((collection) => collection.id), [collections]);

  useEffect(() => {
    if (!open) return;
    setCollectionId((current) => current || collectionOptions[0]?.id || "");
  }, [collectionOptions, open]);

  const resetAndClose = () => {
    if (busy) return;
    setFiles([]);
    setNote("");
    setError("");
    onClose?.();
  };

  const chooseFiles = (selectedFiles) => {
    const nextFiles = Array.from(selectedFiles || []);
    const validationMessage = getUploadValidationMessage(nextFiles);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }
    setFiles(nextFiles);
    setError("");
  };

  const uploadAndAdd = async () => {
    if (!collectionId) {
      setError("Choose a destination collection first.");
      return;
    }
    const validationMessage = getUploadValidationMessage(files);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setBusy(true);
    setError("");
    try {
      const uploadResponse = await fileService.uploadFiles(files, {
        description: note.trim() || undefined,
      });
      if (!uploadResponse?.success) {
        throw new Error(uploadResponse?.message || uploadResponse?.error || "Upload failed.");
      }

      const uploadedFiles = Array.isArray(uploadResponse.data) ? uploadResponse.data : [];
      if (!uploadedFiles.length) throw new Error("No files were uploaded.");

      let attachedCount = 0;
      let attachFailure = null;
      for (const uploadedFile of uploadedFiles) {
        const id = uploadedFile?._id;
        if (!id) continue;
        try {
          const response = await collectionsAPI.addItemToCollection(
            collectionId,
            "file",
            String(id),
          );
          if (!response?.success) throw new Error(response?.message || "Could not add file to collection.");
          attachedCount += 1;
        } catch (attachError) {
          attachFailure = attachError;
          break;
        }
      }

      if (attachedCount) {
        window.dispatchEvent(new CustomEvent(DASHPOINT_COLLECTIONS_CHANGED_EVENT));
      }
      if (attachFailure) {
        const message = `${attachedCount} of ${uploadedFiles.length} uploaded file(s) were added. The rest remain in File Manager.`;
        toast.warning(message);
        setError(message);
        return;
      }
      if (attachedCount !== uploadedFiles.length) {
        const message = `${attachedCount} of ${uploadedFiles.length} uploaded file(s) could be added. Check File Manager for the rest.`;
        toast.warning(message);
        setError(message);
        return;
      }
      if (uploadResponse.partialFailure) {
        const message = `${attachedCount} file(s) were added, but one or more selected files could not be uploaded. Check File Manager for details.`;
        toast.warning(message);
        setError(message);
        return;
      }

      toast.success(`${attachedCount} file${attachedCount === 1 ? "" : "s"} added to the collection.`);
      setFiles([]);
      setNote("");
      onClose?.();
    } catch (uploadError) {
      const message = uploadError?.response?.data?.message || uploadError?.message || "Upload failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={resetAndClose}
      title="Upload to a collection"
      description="Choose where these files belong. They’ll be uploaded to your File Manager and added to that collection."
      closeOnOverlayClick={!busy}
      closeOnEscape={!busy}
      disableClose={busy}
      footer={(
        <div className="flex justify-end gap-2">
          <button type="button" onClick={resetAndClose} disabled={busy} className="rounded-xl border border-hairline px-4 py-2 text-sm font-medium text-muted hover:bg-canvas-soft disabled:opacity-50">Cancel</button>
          <button type="button" onClick={uploadAndAdd} disabled={busy || !collectionId || !files.length} className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-canvas hover:bg-primary-active disabled:cursor-not-allowed disabled:opacity-40">
            {busy ? "Uploading and adding…" : "Upload and add"}
          </button>
        </div>
      )}
    >
      <div className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-ink">Destination collection</span>
          <select
            value={collectionId}
            onChange={(event) => setCollectionId(event.target.value)}
            disabled={busy || !collectionOptions.length}
            className="w-full rounded-xl border border-hairline bg-canvas px-3 py-2.5 text-sm text-ink outline-none focus:border-primary disabled:opacity-60"
          >
            <option value="">{collectionOptions.length ? "Choose a collection" : "No collections available"}</option>
            {collectionOptions.map((collection) => <option key={collection.id} value={collection.id}>{collection.name}</option>)}
          </select>
        </label>

        <div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={FILE_MANAGER_ACCEPT}
            className="sr-only"
            onChange={(event) => chooseFiles(event.target.files)}
            disabled={busy}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="w-full rounded-2xl border border-dashed border-hairline bg-canvas-soft/50 px-4 py-5 text-center transition hover:border-primary hover:bg-canvas-soft disabled:opacity-50"
          >
            <span className="block text-sm font-semibold text-ink">{files.length ? "Choose different files" : "Choose files or images"}</span>
            <span className="mt-1 block text-xs text-muted">Up to 5 files · 10 MB each · 25 MB total · Images and PDFs</span>
          </button>
          {files.length > 0 && (
            <ul className="mt-2 space-y-1">
              {files.map((file, index) => <li key={`${file.name}-${file.size}-${index}`} className="truncate rounded-lg bg-canvas-soft px-3 py-2 text-xs text-ink">{file.name}</li>)}
            </ul>
          )}
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-ink">Context note <span className="font-normal text-muted">(optional)</span></span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            disabled={busy}
            rows={2}
            maxLength={1000}
            placeholder="Add a short note to help identify or explain these files…"
            className="w-full resize-y rounded-xl border border-hairline bg-canvas px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted-soft focus:border-primary disabled:opacity-60"
          />
        </label>
        {error && <p role="alert" className="rounded-xl border border-semantic-error/30 bg-semantic-error/5 px-3 py-2 text-xs text-semantic-error">{error}</p>}
      </div>
    </Modal>
  );
}
