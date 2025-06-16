import { Play, Pause, Volume2, Maximize, X } from "lucide-react";

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
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Play size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">No video selected</p>
          <p className="text-sm">Add a YouTube URL to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative ${
        isFullscreen ? "fixed inset-0 z-50 bg-black" : ""
      }`}
    >
      <div
        className={`relative ${
          isFullscreen ? "h-full" : "aspect-video"
        } bg-black rounded-lg overflow-hidden`}
      >
        <iframe
          ref={playerRef}
          src={`${currentVideo.embedUrl}?autoplay=${
            isPlaying ? 1 : 0
          }&rel=0&modestbranding=1`}
          title={currentVideo.title}
          className="w-full h-full"
          frameBorder="0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />

        {/* Custom Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              <button
                onClick={onTogglePlayPause}
                className="hover:bg-white/20 p-2 rounded"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button className="hover:bg-white/20 p-2 rounded">
                <Volume2 size={20} />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={onToggleFullscreen}
                className="hover:bg-white/20 p-2 rounded"
              >
                <Maximize size={20} />
              </button>
              {isFullscreen && (
                <button
                  onClick={onExitFullscreen}
                  className="hover:bg-white/20 p-2 rounded"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div
        className={`${
          isFullscreen ? "absolute bottom-20 left-4 right-4" : "mt-4"
        } text-white`}
      >
        <h3 className="font-semibold text-lg">{currentVideo.title}</h3>
      </div>
    </div>
  );
};
