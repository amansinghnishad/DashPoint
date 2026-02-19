import useYoutubePageController from "./hooks/useYoutubePageController";
import YoutubePageContent from "./components/YoutubePageContent";

export default function YoutubePage() {
  const controller = useYoutubePageController();
  return <YoutubePageContent {...controller} />;
}
