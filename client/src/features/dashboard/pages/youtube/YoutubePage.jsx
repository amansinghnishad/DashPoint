import YoutubePageContent from "./components/YoutubePageContent";
import useYoutubePageController from "./hooks/useYoutubePageController";

export default function YoutubePage({
  search,
  onClearSearch,
  openVideoId = "",
  openVideoRequestId = "",
}) {
  const controller = useYoutubePageController({ search, onClearSearch, openVideoId, openVideoRequestId });
  return <YoutubePageContent {...controller} />;
}
