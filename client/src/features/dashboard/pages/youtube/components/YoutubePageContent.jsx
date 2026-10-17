import {
  ArrowLeft,
  BookmarkCheck,
  BookmarkPlus,
  ExternalLink,
  FolderPlus,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import AddToCollectionModal from "@/shared/ui/modals/AddToCollectionModal";
import DeleteConfirmModal from "@/shared/ui/modals/DeleteConfirmModal";

import DashboardPageHeader from "../../../../../shared/ui/DashboardPageHeader";

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-hairline bg-surface-card"
        >
          <div className="aspect-video animate-pulse bg-canvas-soft" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-4/5 animate-pulse rounded bg-canvas-soft" />
            <div className="h-3 w-2/5 animate-pulse rounded bg-canvas-soft" />
          </div>
        </div>
      ))}
    </div>
  );
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function VideoCard({
  video,
  saved,
  onWatch,
  onSave,
  onAddToCollection,
  onDelete,
  saving,
  savingActive,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const thumbnail =
    video.thumbnail || `https://i.ytimg.com/vi/${encodeURIComponent(video.videoId)}/hqdefault.jpg`;

  return (
    <article className="group overflow-hidden rounded-2xl border border-hairline bg-surface-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-video overflow-hidden bg-canvas-soft">
        <img
          src={thumbnail}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
        <button
          type="button"
          onClick={onWatch}
          className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/25 focus-visible:bg-black/25"
          aria-label={`Play ${video.title}`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/75 text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100">
            <Play size={19} fill="currentColor" />
          </span>
        </button>
        {video.duration ? (
          <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-1 text-[11px] font-semibold tabular-nums text-white">
            {video.duration}
          </span>
        ) : null}
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3">
          <button type="button" onClick={onWatch} className="min-w-0 flex-1 text-left">
            <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-ink transition group-hover:text-primary">
              {video.title}
            </h3>
          </button>
          {saved ? (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-canvas-soft hover:text-ink"
                aria-label={`Options for ${video.title}`}
                aria-expanded={menuOpen}
              >
                <MoreHorizontal size={18} />
              </button>
              {menuOpen ? (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-20 cursor-default"
                    aria-label="Close video options"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-9 z-30 w-48 rounded-xl border border-hairline bg-surface-card p-1.5 shadow-xl">
                    <a
                      href={video.url || `https://www.youtube.com/watch?v=${video.videoId}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-ink hover:bg-canvas-soft"
                    >
                      <ExternalLink size={14} /> Open on YouTube
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-semantic-error hover:bg-semantic-error/10"
                    >
                      <Trash2 size={14} /> Remove from library
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mt-2 flex min-h-5 items-center gap-2 text-xs text-muted">
          <span className="max-w-[65%] truncate font-medium">
            {video.channelTitle || video.channel || "YouTube"}
          </span>
          {video.date ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{formatDate(video.date) || video.date}</span>
            </>
          ) : null}
        </div>
        {video.description ? (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-soft">{video.description}</p>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-hairline/70 pt-3">
          <button
            type="button"
            onClick={onWatch}
            className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-ink transition hover:bg-canvas-soft"
          >
            <Play size={13} /> Watch
          </button>
          {saved ? (
            <button
              type="button"
              onClick={onAddToCollection}
              className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-ink transition hover:bg-canvas-soft"
            >
              <FolderPlus size={14} className="text-primary" /> Add to collection
            </button>
          ) : (
            <button
              type="button"
              onClick={onSave}
              disabled={savingActive}
              className="dp-btn-primary inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold disabled:cursor-wait disabled:opacity-60"
            >
              {saving ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />
              ) : (
                <BookmarkPlus size={14} />
              )}
              {saving ? "Saving…" : "Save to library"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function YoutubePageContent({
  search,
  uiState,
  addVideo,
  items,
  savedItems = [],
  savedLoading = false,
  savingVideoId = null,
  selectedId,
  setSelectedId,
  saveVideoById,
  dispatchUi,
  searchState,
  selected,
  viewer,
  inputRef,
  confirmDelete,
}) {
  const [activeView, setActiveView] = useState("library");
  const query = String(search || "").trim();

  useEffect(() => {
    setActiveView(query ? "search" : "library");
  }, [query]);

  const savedByVideoId = useMemo(
    () => new Map(savedItems.map((video) => [video.videoId, video])),
    [savedItems],
  );

  const videos = useMemo(() => {
    if (activeView === "library") return savedItems;
    if (!query) return [];
    return (items || []).map((video) => {
      const savedVideo = savedByVideoId.get(video.videoId);
      return savedVideo ? { ...video, id: savedVideo.id, isSaved: true } : video;
    });
  }, [activeView, items, query, savedByVideoId, savedItems]);

  const activeDeleteItem = uiState.deleteItem;

  return (
    <section className="relative mx-auto w-full max-w-6xl py-4">
      {selectedId && selected ? (
        <div className="space-y-5">
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-semibold text-muted transition hover:bg-canvas-soft hover:text-ink"
          >
            <ArrowLeft size={16} /> Back to videos
          </button>
          <div className="overflow-hidden rounded-2xl border border-hairline bg-surface-card shadow-sm">
            {viewer}
            <div className="flex flex-wrap items-start justify-between gap-4 p-5 sm:p-6">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold leading-6 text-ink">{selected.title}</h2>
                <p className="mt-1 text-sm text-muted">
                  {selected.channelTitle || selected.channel || "YouTube"}
                </p>
                {selected.description ? (
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
                    {selected.description}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {selected.isSaved ? (
                  <>
                    <button
                      type="button"
                      onClick={() => dispatchUi({ type: "OPEN_ADD_COLLECTION", payload: selected })}
                      title="Add to collection"
                      aria-label="Add to collection"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-muted transition hover:bg-canvas-soft hover:text-ink"
                    >
                      <FolderPlus size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatchUi({ type: "OPEN_DELETE", payload: selected })}
                      title="Remove from library"
                      aria-label="Remove from library"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-muted transition hover:bg-semantic-error/10 hover:text-semantic-error"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => saveVideoById(selected.videoId, selected.url)}
                    disabled={Boolean(savingVideoId)}
                    title="Save to library"
                    aria-label="Save to library"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-muted transition hover:bg-canvas-soft hover:text-ink disabled:opacity-50"
                  >
                    {savingVideoId === selected.videoId ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                    ) : (
                      <BookmarkPlus size={16} />
                    )}
                  </button>
                )}
                <a
                  href={selected.url || `https://www.youtube.com/watch?v=${selected.videoId}`}
                  target="_blank"
                  rel="noreferrer"
                  title="Open on YouTube"
                  aria-label="Open on YouTube"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-muted transition hover:bg-canvas-soft hover:text-ink"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <DashboardPageHeader
            title="YouTube"
            description="Search for videos, watch them here, and save the ones you want to keep."
            action={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveView("library")}
                  title="Saved videos"
                  aria-label={`Saved videos, ${savedItems.length} saved`}
                  aria-pressed={activeView === "library"}
                  className={`inline-flex h-9 items-center gap-2 rounded-full border border-hairline px-3 text-xs font-semibold transition ${
                    activeView === "library"
                      ? "bg-ink text-canvas"
                      : "text-muted hover:bg-canvas-soft hover:text-ink"
                  }`}
                >
                  <BookmarkCheck size={15} />
                  <span className="hidden sm:inline">Saved videos</span>
                  <span className="tabular-nums opacity-70">{savedItems.length}</span>
                </button>
                <button
                  type="button"
                  onClick={() => dispatchUi({ type: "SET_ADDING", payload: true })}
                  className="dp-btn-secondary inline-flex h-9 items-center gap-2 rounded-full px-4 text-xs font-semibold"
                >
                  <Plus size={14} /> Add by link
                </button>
              </div>
            }
          />

          {uiState.isAdding ? (
            <form
              className="mt-4 flex flex-col gap-3 rounded-2xl border border-hairline bg-surface-card p-4 shadow-sm sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                addVideo();
              }}
            >
              <input
                ref={inputRef}
                value={uiState.urlInput}
                onChange={(event) => dispatchUi({ type: "SET_URL", payload: event.target.value })}
                placeholder="Paste a YouTube link or video ID"
                aria-label="YouTube video link or ID"
                className="h-10 min-w-0 flex-1 rounded-xl border border-hairline bg-canvas px-3.5 text-sm text-ink outline-none focus:border-primary/50"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={uiState.isLoading}
                  className="dp-btn-primary h-10 rounded-full px-5 text-xs font-semibold disabled:opacity-60"
                >
                  {uiState.isLoading ? "Adding…" : "Add video"}
                </button>
                <button
                  type="button"
                  onClick={() => dispatchUi({ type: "RESET_ADD_FORM" })}
                  className="dp-btn-secondary h-10 rounded-full px-4 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : null}

          <div className="mt-5">
            {activeView === "library" && savedLoading ? (
              <LoadingGrid />
            ) : activeView === "search" && searchState?.isLoading ? (
              <LoadingGrid />
            ) : activeView === "search" && searchState?.error ? (
              <div className="rounded-2xl border border-semantic-error/20 bg-semantic-error/5 p-6 text-center">
                <p className="text-sm font-semibold text-semantic-error">YouTube search failed</p>
                <p className="mt-1 text-sm text-muted">{searchState.error}</p>
              </div>
            ) : !videos.length ? (
              <div className="rounded-2xl border border-dashed border-hairline bg-surface-card/60 px-5 py-14 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-canvas-soft text-muted">
                  {activeView === "library" ? <BookmarkCheck size={21} /> : <Search size={21} />}
                </div>
                <h3 className="mt-4 text-sm font-semibold text-ink">
                  {activeView === "library"
                    ? "Your saved videos will appear here"
                    : query.length < 2
                      ? "Search YouTube"
                      : "No videos found"}
                </h3>
                <p className="mx-auto mt-1 w-full max-w-[448px] px-2 text-sm leading-6 text-muted">
                  {activeView === "library"
                    ? "Search for videos to save here, or add a video directly by link. Organize saved videos in collections and play them anytime."
                    : query.length < 2
                      ? "Enter at least two characters to find videos."
                      : "Try a different search phrase."}
                </p>
                {activeView === "library" ? (
                  <button
                    type="button"
                    onClick={() => setActiveView("search")}
                    className="dp-btn-primary mt-4 h-9 rounded-full px-4 text-xs font-semibold"
                  >
                    Find videos
                  </button>
                ) : null}
              </div>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between text-xs text-muted">
                  <span>
                    {activeView === "library"
                      ? "In your library"
                      : query
                        ? `Results for “${query}”`
                        : "Search results"}
                  </span>
                  <span className="tabular-nums">
                    {videos.length} {videos.length === 1 ? "video" : "videos"}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {videos.map((video) => {
                    const savedVideo = savedByVideoId.get(video.videoId);
                    const saved = activeView === "library" || Boolean(savedVideo) || video.isSaved;
                    const libraryItem = savedVideo || video;

                    return (
                      <VideoCard
                        key={video.videoId || video.id}
                        video={video}
                        saved={saved}
                        saving={savingVideoId === video.videoId}
                        savingActive={Boolean(savingVideoId)}
                        onWatch={() => setSelectedId(video.id)}
                        onSave={() => saveVideoById(video.videoId, video.url)}
                        onAddToCollection={() =>
                          dispatchUi({ type: "OPEN_ADD_COLLECTION", payload: libraryItem })
                        }
                        onDelete={() => dispatchUi({ type: "OPEN_DELETE", payload: libraryItem })}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </>
      )}

      <AddToCollectionModal
        open={Boolean(uiState.addToCollectionItem)}
        onClose={() => dispatchUi({ type: "CLOSE_ADD_COLLECTION" })}
        itemType="youtube"
        itemId={uiState.addToCollectionItem?.id || null}
        itemTitle={uiState.addToCollectionItem?.title || null}
      />
      <DeleteConfirmModal
        open={Boolean(activeDeleteItem)}
        onClose={() => {
          if (!uiState.isDeleting) dispatchUi({ type: "CLOSE_DELETE" });
        }}
        onConfirm={confirmDelete}
        title={activeDeleteItem?.title ? `Remove “${activeDeleteItem.title}”?` : "Remove video"}
        description="This removes the video from your saved library."
        busy={uiState.isDeleting}
      />
    </section>
  );
}
