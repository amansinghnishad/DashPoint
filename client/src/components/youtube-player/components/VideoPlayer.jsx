import {
  Play,
  Pause,
  Volume2,
  Maximize,
  X,
  Youtube,
  Sparkles,
} from "lucide-react";

export const VideoPlayer = ({
  currentVideo,
  isPlaying,
  isFullscreen,
  onTogglePlayPause,
  onToggleFullscreen,
  onExitFullscreen,
  playerRef,
}) => {
  if (!currentVideo) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="aspect-video flex items-center justify-center p-8">
          <div className="text-center max-w-md mx-auto">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full mb-3">
              <Youtube size={18} className="text-gray-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              No video selected
            </h3>
            <p className="text-sm text-gray-600">
              Add a URL or pick a video from the playlist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div
        className={`relative ${
          isFullscreen ? "fixed inset-0 z-50 bg-black" : ""
        }`}
      >
        <div
          className={`relative ${
            isFullscreen ? "h-full" : "aspect-video"
          } bg-black ${isFullscreen ? "" : "rounded-t-xl"} overflow-hidden`}
        >
          <iframe
            ref={playerRef}
            src={`${currentVideo.embedUrl}?autoplay=${
              isPlaying ? 1 : 0
            }&rel=0&modestbranding=1&color=white`}
            title={currentVideo.title}
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          />

          {/* Custom Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-3">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <button
                  onClick={onTogglePlayPause}
                  className="hover:bg-white/15 p-2 rounded-md"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause size={22} /> : <Play size={22} />}
                </button>
                <button
                  className="hover:bg-white/15 p-2 rounded-md"
                  title="Volume"
                >
                  <Volume2 size={20} />
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={onToggleFullscreen}
                  className="hover:bg-white/15 p-2 rounded-md"
                  title="Fullscreen"
                >
                  <Maximize size={20} />
                </button>
                {isFullscreen && (
                  <button
                    onClick={onExitFullscreen}
                    className="hover:bg-white/15 p-2 rounded-md"
                    title="Exit Fullscreen"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Video Info */}
        {!isFullscreen && (
          <div className="p-5">
            <h3 className="font-semibold text-base text-gray-900 line-clamp-2 mb-1">
              {currentVideo.title}
            </h3>
            {currentVideo.channelTitle && (
              <p className="text-sm text-gray-600 mb-3">
                by {currentVideo.channelTitle}
              </p>
            )}
            {(currentVideo.duration || currentVideo.viewCount) && (
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {currentVideo.duration && <span>{currentVideo.duration}</span>}
                {currentVideo.viewCount && (
                  <span>{currentVideo.viewCount.toLocaleString()} views</span>
                )}
              </div>
            )}

            {/* AI Summary Display */}
            {currentVideo.summaryGenerated && currentVideo.aiSummary && (
              <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center mb-2">
                  <Sparkles size={16} className="text-gray-600 mr-2" />
                  <h4 className="font-semibold text-gray-900">AI summary</h4>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {currentVideo.aiSummary}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
