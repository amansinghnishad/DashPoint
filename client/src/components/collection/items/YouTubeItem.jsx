import { useState } from "react";
import { Youtube, Play } from "lucide-react";
import { extractYouTubeId } from "../utils/itemHelpers";

export const YouTubeItem = ({ item, className = "" }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const videoId = extractYouTubeId(
    item.itemData?.url || item.itemData?.embedUrl
  );

  if (!videoId) {
    return (
      <div
        className={`w-full h-full bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
      >
        <div className="text-center text-gray-500">
          <Youtube size={32} className="mx-auto mb-2" />
          <p className="text-sm">Invalid YouTube URL</p>
        </div>
      </div>
    );
  }

  if (isPlaying) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
        title={item.itemData?.title || "YouTube Video"}
        className={`w-full h-full rounded-lg ${className}`}
        frameBorder="0"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    );
  }

  return (
    <div
      className={`relative w-full h-full cursor-pointer bg-black rounded-lg flex items-center justify-center ${className}`}
      onClick={() => setIsPlaying(true)}
    >
      {item.itemData?.thumbnail ? (
        <img
          src={item.itemData.thumbnail}
          alt={item.itemData?.title || "YouTube Video"}
          className="w-full h-full object-cover rounded-lg"
        />
      ) : (
        <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
          <Youtube size={48} className="text-red-500" />
        </div>
      )}
      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg">
        <Play size={48} className="text-white" />
      </div>
      {item.itemData?.duration && (
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
          {item.itemData.duration}
        </div>
      )}
    </div>
  );
};
