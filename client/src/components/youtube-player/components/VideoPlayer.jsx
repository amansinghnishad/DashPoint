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
      <div className="glass-effect rounded-2xl shadow-xl card-hover">
        <div className="aspect-video flex items-center justify-center p-8">
          <div className="text-center max-w-md mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mb-6 shadow-lg">
              <Youtube size={40} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Ready to Play
            </h3>
            <p className="text-gray-600 mb-2 leading-relaxed">
              Add a YouTube URL to get started with your playlist
            </p>
            <p className="text-sm text-gray-500">
              Your videos will appear here for seamless playback
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-effect rounded-2xl overflow-hidden shadow-xl card-hover">
      <div
        className={`relative ${
          isFullscreen ? "fixed inset-0 z-50 bg-black" : ""
        }`}
      >
        <div
          className={`relative ${
            isFullscreen ? "h-full" : "aspect-video"
          } bg-black ${isFullscreen ? "" : "rounded-t-2xl"} overflow-hidden`}
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
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <button
                  onClick={onTogglePlayPause}
                  className="hover:bg-white/20 p-2 rounded-full transition-all duration-300 hover:scale-110"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause size={22} /> : <Play size={22} />}
                </button>
                <button
                  className="hover:bg-white/20 p-2 rounded-full transition-all duration-300 hover:scale-110"
                  title="Volume"
                >
                  <Volume2 size={20} />
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={onToggleFullscreen}
                  className="hover:bg-white/20 p-2 rounded-full transition-all duration-300 hover:scale-110"
                  title="Fullscreen"
                >
                  <Maximize size={20} />
                </button>
                {isFullscreen && (
                  <button
                    onClick={onExitFullscreen}
                    className="hover:bg-white/20 p-2 rounded-full transition-all duration-300 hover:scale-110"
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
          <div className="p-6 bg-gradient-to-r from-gray-50/50 to-white/50">
            <h3 className="font-bold text-xl text-gray-900 line-clamp-2 mb-2">
              {currentVideo.title}
            </h3>
            {currentVideo.channelTitle && (
              <p className="text-gray-600 font-medium mb-3">
                by {currentVideo.channelTitle}
              </p>
            )}
            {(currentVideo.duration || currentVideo.viewCount) && (
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                {currentVideo.duration && (
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span>{currentVideo.duration}</span>
                  </span>
                )}
                {currentVideo.viewCount && (
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>{currentVideo.viewCount.toLocaleString()} views</span>
                  </span>
                )}
              </div>
            )}

            {/* AI Summary Display */}
            {currentVideo.summaryGenerated && currentVideo.aiSummary && (
              <div className="mt-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Sparkles size={16} className="text-purple-600 mr-2" />
                  <h4 className="font-semibold text-purple-800">
                    DashPoint AI Summary
                  </h4>
                </div>
                <p className="text-sm text-purple-700 leading-relaxed">
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
