import { useEffect, useMemo, useState } from "react";
import { Image, FileText, Plus } from "lucide-react";
import { Modal, Button } from "../../ui";
import fileService from "../../../services/fileService";
import { collectionsAPI } from "../../../services/api";
import { useToast } from "../../../hooks/useToast";

export const AddFileToCollectionModal = ({
  isOpen,
  onClose,
  collectionId,
  onItemAdded,
  mode = "file",
}) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const { success, error } = useToast();

  const title = mode === "photo" ? "Add photo" : "Add file";

  const queryParams = useMemo(() => {
    if (mode === "photo") return { category: "image", limit: 50 };
    return { limit: 50 };
  }, [mode]);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fileService.getFiles(queryParams);
        if (cancelled) return;

        if (res?.success) {
          setFiles(Array.isArray(res.data) ? res.data : []);
        } else {
          setFiles([]);
        }
      } catch {
        if (!cancelled) {
          setFiles([]);
          error("Failed to load files");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [error, isOpen, queryParams]);

  const handleAdd = async (fileId) => {
    if (!collectionId || !fileId) return;

    try {
      setAddingId(fileId);
      const res = await collectionsAPI.addItemToCollection(
        collectionId,
        "file",
        fileId
      );

      if (res?.success) {
        success(mode === "photo" ? "Photo added" : "File added");
        onItemAdded?.();
        onClose?.();
      } else {
        throw new Error(res?.message || "Failed to add file");
      }
    } catch (e) {
      error(e?.message || "Failed to add file");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="py-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-7 w-7 border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : files.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-500">
            No {mode === "photo" ? "photos" : "files"} found.
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((f) => {
              const isImage = String(f.mimetype || "").startsWith("image/");
              const Icon = isImage ? Image : FileText;

              return (
                <div
                  key={f._id}
                  className="w-full flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-gray-700" />
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {f.originalName || f.filename}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {f.formattedSize || ""}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    disabled={addingId === f._id}
                    className="shrink-0"
                    onClick={() => handleAdd(f._id)}
                  >
                    <Plus size={16} className="mr-2" />
                    Add
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-4 mt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
