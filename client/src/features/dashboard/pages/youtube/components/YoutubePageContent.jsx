import DashboardPageLayout from "../../../layouts/DashboardPageLayout";
import AddToCollectionModal from "@/shared/ui/modals/AddToCollectionModal";
import DeleteConfirmModal from "@/shared/ui/modals/DeleteConfirmModal";
import { BookmarkPlus, IconAdd, IconDelete } from "@/shared/ui/icons";
import SearchEmptyState from "./SearchEmptyState";
import YoutubeViewer from "./YoutubeViewer";

export default function YoutubePageContent({
  search,
  dispatchSearch,
  uiState,
  addVideo,
  items,
  selectedId,
  setSelectedId,
  saveVideoById,
  dispatchUi,
  isSearchMode,
  searchState,
  selected,
  viewer,
  inputRef,
  confirmDelete,
}) {
  return (
    <>
      <DashboardPageLayout
        title="YouTube"
        searchValue={search}
        onSearchChange={(value) =>
          dispatchSearch({ type: "SET_QUERY", payload: value })
        }
        addLabel={
          uiState.isAdding
            ? uiState.isLoading
              ? "Saving..."
              : "Save"
            : "Search"
        }
        onAdd={() => {
          if (!uiState.isAdding) {
            dispatchUi({ type: "SET_ADDING", payload: true });
            return;
          }
          if (!uiState.isLoading) addVideo();
        }}
        addDisabled={uiState.isLoading}
        items={items}
        selectedId={selectedId}
        onSelect={(it) => setSelectedId(it.id)}
        renderItemLeading={(it) => {
          const src = it?.thumbnail || null;
          if (!src) return null;
          return (
            <img
              src={src}
              alt=""
              className="h-10 w-16 rounded-md object-cover dp-border border"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          );
        }}
        renderItemTitle={(it) => it.title}
        renderItemSubtitle={(it) => it.url}
        renderItemActions={(it) => {
          const disabled = uiState.isLoading;

          if (!it?.isSaved) {
            return (
              <button
                type="button"
                className="dp-btn-icon inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors disabled:opacity-60"
                disabled={disabled}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!it?.videoId) return;
                  saveVideoById(it.videoId, it.url, { clearSearch: true });
                }}
                aria-label="Save video"
                title="Save video"
              >
                <BookmarkPlus size={16} />
              </button>
            );
          }

          return (
            <>
              <button
                type="button"
                className="dp-btn-icon inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors disabled:opacity-60"
                disabled={disabled}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  dispatchUi({ type: "OPEN_ADD_COLLECTION", payload: it });
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
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!it?.id) return;
                  dispatchUi({ type: "OPEN_DELETE", payload: it });
                }}
                aria-label="Delete"
                title="Delete"
              >
                <IconDelete size={16} />
              </button>
            </>
          );
        }}
        renderEmptySidebar={
          <SearchEmptyState
            isSearchMode={isSearchMode}
            search={search}
            searchState={searchState}
          />
        }
        viewer={
          <YoutubeViewer
            selected={selected}
            isAdding={uiState.isAdding}
            urlInput={uiState.urlInput}
            onUrlChange={(value) =>
              dispatchUi({ type: "SET_URL", payload: value })
            }
            onAdd={addVideo}
            onCancel={() => dispatchUi({ type: "RESET_ADD_FORM" })}
            viewer={viewer}
            isLoading={uiState.isLoading}
            inputRef={inputRef}
          />
        }
      />

      <AddToCollectionModal
        open={Boolean(uiState.addToCollectionItem)}
        onClose={() => dispatchUi({ type: "CLOSE_ADD_COLLECTION" })}
        itemType="youtube"
        itemId={uiState.addToCollectionItem?.id || null}
        itemTitle={uiState.addToCollectionItem?.title || null}
      />

      <DeleteConfirmModal
        open={Boolean(uiState.deleteItem)}
        onClose={() => {
          if (uiState.isDeleting) return;
          dispatchUi({ type: "CLOSE_DELETE" });
        }}
        onConfirm={confirmDelete}
        title={
          uiState.deleteItem?.title
            ? `Delete: ${uiState.deleteItem.title}`
            : "Delete video"
        }
        description="Delete this saved video?"
        busy={uiState.isDeleting}
      />
    </>
  );
}
