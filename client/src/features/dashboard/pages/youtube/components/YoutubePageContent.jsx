import {
  BookmarkPlus,
  ArrowLeft,
  ArrowRight,
  MoreVertical,
  Trash2,
  FolderPlus,
  Star,
  Lock,
} from "lucide-react";
import { useState, useMemo } from "react";

import { useToast } from "@/hooks/useToast";
import AddToCollectionModal from "@/shared/ui/modals/AddToCollectionModal";
import ContentInsightReviewModal from "@/shared/ui/modals/ContentInsightReviewModal";
import DeleteConfirmModal from "@/shared/ui/modals/DeleteConfirmModal";

const MOCK_THUMBNAILS = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&h=340&q=80",
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&h=340&q=80",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&h=340&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&h=340&q=80",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&h=450&q=80",
];

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col justify-between animate-pulse">
          <div className="aspect-video rounded-xl bg-canvas-soft border border-hairline/40 w-full" />
          <div className="bg-canvas-soft h-4 w-2/3 rounded mt-4" />
          <div className="bg-canvas-soft h-3 w-1/3 rounded mt-2" />
          <div className="bg-canvas-soft h-6 w-24 rounded-full mt-4" />
        </div>
      ))}
    </div>
  );
}

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
  insightQueue,
  setInsightQueue,
}) {
  const toast = useToast();
  const activeInsight = insightQueue?.[0] || null;

  const closeActiveInsight = () => {
    setInsightQueue?.((current) => current.slice(1));
  };

  // Convert database items to visual cards (no static code)
  const allVideos = useMemo(() => {
    return (items || []).map((it, idx) => ({
      id: it.id || it.videoId,
      videoId: it.videoId || it.id,
      title: it.title || "Untitled Video",
      thumbnail: it.thumbnail || MOCK_THUMBNAILS[idx % MOCK_THUMBNAILS.length],
      duration: it.duration || "12:15",
      channel: it.channelTitle || it.channel || "YouTube Creator",
      description: it.description || it.original?.description || "No description available.",
      date: it.date || "Just now",
      url: it.url,
      isSaved: it.isSaved ?? true,
      original: it,
    }));
  }, [items]);

  // Filter items based on local search query if we are not in remote API search mode
  const filteredVideos = useMemo(() => {
    if (isSearchMode) return allVideos; // Remote API results are already filtered
    const q = (search || "").trim().toLowerCase();
    if (!q) return allVideos;
    return allVideos.filter((v) => v.title.toLowerCase().includes(q));
  }, [allVideos, search, isSearchMode]);

  // Featured video selection is dynamic: the first video in the list (when not searching)
  const featuredVideo = useMemo(() => {
    if (isSearchMode || !filteredVideos.length) return null;
    return filteredVideos[0];
  }, [filteredVideos, isSearchMode]);

  const [activeMenuId, setActiveMenuId] = useState(null);

  return (
    <>
      <div className="w-full max-w-[1024px] mx-auto py-4 relative">
        {/* Full-width video viewer state */}
        {selectedId && selected ? (
          <div className="w-full">
            <button
              onClick={() => setSelectedId(null)}
              className="flex items-center gap-2 text-ink hover:opacity-80 mb-6 font-semibold text-sm transition-opacity"
            >
              <ArrowLeft size={16} />
              <span>Back to Videos</span>
            </button>
            <div className="bg-surface-card border border-hairline rounded-2xl overflow-hidden shadow-sm p-6">
              <h3 className="font-waldenburg-light text-2xl text-ink font-bold mb-4">{selected.title}</h3>
              {viewer}
            </div>
          </div>
        ) : (
          /* Grid list view */
          <div>
            {/* Breadcrumbs & Title */}
            <div className="text-[12px] text-muted-soft tracking-wider flex items-center gap-1.5 font-medium mb-3 select-none">
              <span className="opacity-70">INTELLIGENCE LAYER</span>
              <span className="opacity-30">/</span>
              <span className="opacity-70 font-semibold text-ink">MULTIMEDIA</span>
            </div>

            <div className="mb-8 min-w-0">
              <h2 className="font-waldenburg-light text-5xl text-ink leading-tight select-none">
                {isSearchMode ? "Search Results" : "YouTube"}
              </h2>
            </div>

            <div className="border-t border-b border-hairline/60 py-4 flex flex-wrap items-center justify-between gap-4 mb-8 text-xs select-none">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-medium text-muted">
                <span>Filter by:</span>
                <button className="flex items-center gap-1.5 text-ink font-semibold">
                  <span>All Channels</span>
                  <span className="text-[10px] opacity-70">▼</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-ink transition-colors">
                  <span>Most Recent</span>
                  <span className="text-[10px] opacity-70">▼</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-ink transition-colors">
                  <span>Categories</span>
                  <span className="text-[10px] opacity-70">▼</span>
                </button>
              </div>
              <div className="text-muted-soft font-medium">
                Showing {filteredVideos.length} of 128 items
              </div>
            </div>

            {/* Add Video Inline Input Form */}
            {uiState.isAdding ? (
              <div className="bg-surface-card border border-hairline rounded-2xl p-6 shadow-sm mb-8 max-w-[640px] mx-auto animate-slide-down">
                <h4 className="text-ink font-bold text-base mb-1">Add a YouTube video</h4>
                <p className="text-muted text-xs mb-4">Paste a YouTube URL or video identifier to ingest.</p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    ref={inputRef}
                    value={uiState.urlInput}
                    onChange={(e) => dispatchUi({ type: "SET_URL", payload: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="border border-hairline bg-canvas-soft text-ink w-full rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/20"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={addVideo}
                      className="bg-primary hover:bg-primary-active text-canvas rounded-full px-5 py-2 text-sm font-semibold transition-all shrink-0"
                      disabled={uiState.isLoading}
                    >
                      {uiState.isLoading ? "Saving..." : "Add"}
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatchUi({ type: "RESET_ADD_FORM" })}
                      className="bg-transparent hover:bg-hairline-soft border border-hairline text-ink rounded-full px-5 py-2 text-sm font-semibold transition-all shrink-0"
                      disabled={uiState.isLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Loading Grid */}
            {searchState?.loading ? (
              <LoadingGrid />
            ) : searchState?.error ? (
              <div className="border border-hairline bg-surface-card rounded-2xl p-6 text-center select-none">
                <p className="text-semantic-error font-medium">YouTube search failed</p>
                <p className="text-body mt-1 text-sm">{searchState.error}</p>
              </div>
            ) : !filteredVideos.length ? (
              <div className="border border-hairline bg-surface-card rounded-2xl p-8 text-center">
                <p className="text-ink font-semibold">No saved videos yet</p>
                <p className="text-body mt-1 text-sm">
                  Click "+ Add Video" above to search YouTube or paste a URL to build your library.
                </p>
              </div>
            ) : (
              /* Main Cards Grid */
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {(featuredVideo ? filteredVideos.slice(1) : filteredVideos).map((it, index) => (
                  <div
                    key={it.id || index}
                    className="group flex flex-col justify-between"
                  >
                    {/* Thumbnail container */}
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-canvas-soft border border-hairline/60 shadow-sm transition-transform duration-300 group-hover:-translate-y-1">
                      <img
                        src={it.thumbnail}
                        alt={it.title}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => {
                          if (it.isSaved) {
                            setSelectedId(it.id);
                          } else {
                            saveVideoById(it.videoId, it.url, { clearSearch: true });
                          }
                        }}
                      />
                      {it.isSaved ? (
                        <span className="absolute bottom-2 right-2 bg-[#0c0a09]/80 text-[#ffffff] px-2 py-0.5 rounded text-[11px] font-semibold tracking-wider font-mono select-none">
                          {it.duration}
                        </span>
                      ) : (
                        <span className="absolute bottom-2 right-2 bg-[#0c0a09]/85 text-gradient-mint px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase select-none">
                          Search Result
                        </span>
                      )}
                    </div>

                    {/* Header Title & Action dots */}
                    <div className="flex justify-between items-start mt-4 gap-2 relative">
                      <h4
                        onClick={() => {
                          if (it.isSaved) {
                            setSelectedId(it.id);
                          } else {
                            saveVideoById(it.videoId, it.url, { clearSearch: true });
                          }
                        }}
                        className="font-bold text-ink text-sm leading-snug line-clamp-2 hover:underline cursor-pointer flex-1"
                      >
                        {it.title}
                      </h4>

                      {/* Action dropdown toggle (Only show if saved!) */}
                      {it.isSaved ? (
                        <div className="shrink-0 relative">
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === it.id ? null : it.id)}
                            className="text-muted hover:text-ink p-1 rounded-lg hover:bg-canvas-soft transition-colors"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {activeMenuId === it.id ? (
                            <div className="absolute right-0 top-8 z-20 w-36 bg-surface-card border border-hairline rounded-xl shadow-lg p-1.5 flex flex-col gap-1">
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  dispatchUi({ type: "OPEN_ADD_COLLECTION", payload: it.original || it });
                                }}
                                className="w-full text-left text-xs font-semibold text-ink hover:bg-canvas-soft px-2.5 py-1.5 rounded-lg flex items-center gap-2"
                              >
                                <FolderPlus size={14} />
                                <span>Add to Album</span>
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  dispatchUi({ type: "OPEN_DELETE", payload: it.original || it });
                                }}
                                className="w-full text-left text-xs font-semibold text-semantic-error hover:bg-semantic-error/10 px-2.5 py-1.5 rounded-lg flex items-center gap-2"
                              >
                                <Trash2 size={14} />
                                <span>Delete Video</span>
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-muted-soft uppercase tracking-wider select-none pt-1">
                          Unsaved
                        </span>
                      )}
                    </div>

                    {/* Channel & Date info */}
                    <p className="text-xs text-muted-soft mt-1.5 font-medium select-none">
                      {it.channel} {it.date ? `• ${it.date}` : ""}
                    </p>

                    {/* Action Button: View Details (if saved) or Save (if not saved) */}
                    {it.isSaved ? (
                      <button
                        onClick={() => setSelectedId(it.id)}
                        className="flex items-center gap-1.5 text-xs text-ink font-semibold hover:opacity-80 transition-opacity mt-3 w-fit"
                      >
                        <span>View Details</span>
                        <ArrowRight size={12} />
                      </button>
                    ) : (
                      <button
                        onClick={() => saveVideoById(it.videoId, it.url, { clearSearch: true })}
                        className="bg-primary hover:bg-primary-active text-canvas rounded-full px-4 py-1.5 text-xs font-semibold mt-3 flex items-center gap-1.5 transition-all w-fit shadow-sm"
                      >
                        <BookmarkPlus size={14} />
                        <span>Save to Library</span>
                      </button>
                    )}
                  </div>
                ))}

                {/* Dynamic Featured Analysis Row spanning 2 columns (uses the first video in the list) */}
                {featuredVideo && (
                  <div className="lg:col-span-2 bg-surface-card border border-hairline rounded-2xl overflow-hidden p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                    {/* Left Half: Thumbnail with badge */}
                    <div className="w-full md:w-1/2 relative aspect-video rounded-xl overflow-hidden bg-canvas-soft border border-hairline/60 shrink-0">
                      <img
                        src={featuredVideo.thumbnail}
                        alt={featuredVideo.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 bg-[#0c0a09]/80 text-[#ffffff] px-2.5 py-1 rounded text-[10px] font-bold tracking-widest uppercase select-none">
                        Featured Analysis
                      </span>
                    </div>

                    {/* Right Half: Details & action */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h4 className="font-waldenburg-light text-xl font-bold text-ink leading-tight tracking-tight">
                          {featuredVideo.title}
                        </h4>
                        <p className="text-body text-xs leading-relaxed mt-2.5 line-clamp-3">
                          {featuredVideo.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 mt-6">
                        <button
                          onClick={() => setSelectedId(featuredVideo.id)}
                          className="bg-primary hover:bg-primary-active text-canvas rounded-full px-5 py-2.5 text-xs font-bold transition-all h-9 flex items-center justify-center shadow-sm shrink-0"
                        >
                          Watch Full Briefing
                        </button>
                        <span className="text-[11px] font-bold text-muted-soft uppercase tracking-wider select-none">
                          {featuredVideo.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Album Modal */}
      <AddToCollectionModal
        open={Boolean(uiState.addToCollectionItem)}
        onClose={() => dispatchUi({ type: "CLOSE_ADD_COLLECTION" })}
        itemType="youtube"
        itemId={uiState.addToCollectionItem?.id || null}
        itemTitle={uiState.addToCollectionItem?.title || null}
      />

      {/* Delete Modal */}
      <DeleteConfirmModal
        open={Boolean(uiState.deleteItem)}
        onClose={() => {
          if (uiState.isDeleting) return;
          dispatchUi({ type: "CLOSE_DELETE" });
        }}
        onConfirm={confirmDelete}
        title={uiState.deleteItem?.title ? `Delete: ${uiState.deleteItem.title}` : "Delete video"}
        description="Delete this saved video?"
        busy={uiState.isDeleting}
      />

      {/* Insight Review Modal */}
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
