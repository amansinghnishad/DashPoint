import YoutubePageContent from "./components/YoutubePageContent";
import useYoutubePageController from "./hooks/useYoutubePageController";

export default function YoutubePage({ search, onClearSearch }) {
  const controller = useYoutubePageController({ search, onClearSearch });
  return <YoutubePageContent {...controller} />;
}
