import { useRef } from "react";
import DashboardPageLayout from "../layouts/DashboardPageLayout";
import AddToCollectionModal from "../../../shared/ui/modals/AddToCollectionModal";
import DeleteConfirmModal from "../../../shared/ui/modals/DeleteConfirmModal";
import { IconAdd, IconDelete } from "@/shared/ui/icons";
import { FILE_MANAGER_ACCEPT } from "./fileManager/fileManager.helpers";
import { useFileManager } from "./fileManager/useFileManager";

export default function FileManagerPage() {
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
    },
    actions: {
      setSearch,
      setSelectedId,
      setAddToCollectionItem,
      setDeleteItem,
      uploadSelectedFiles,
      removeFile,
      downloadSelectedFile,
    },
  } = useFileManager();

  const fileInputRef = useRef(null);

  const onPickFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    await uploadSelectedFiles(files);
  };

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
              {selected.id ? (
                <button
                  type="button"
                  onClick={downloadSelectedFile}
                  className="dp-text mt-3 inline-block text-sm underline"
                >
                  Download
                </button>
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
        accept={FILE_MANAGER_ACCEPT}
      />

      <DashboardPageLayout
        title="File Manager"
        searchValue={search}
        onSearchChange={setSearch}
        addLabel="Add"
        onAdd={() => {
          if (!fileInputRef.current) {
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
                onClick={(e) => {
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
        onConfirm={removeFile}
        title={
          deleteItem?.title ? `Delete: ${deleteItem.title}` : "Delete file"
        }
        description="Delete this file?"
        busy={isDeleting}
      />
    </>
  );
}
