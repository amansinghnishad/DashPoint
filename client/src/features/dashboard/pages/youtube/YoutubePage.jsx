import YoutubePageContent from "./components/YoutubePageContent";
import useYoutubePageController from "./hooks/useYoutubePageController";

export default function YoutubePage() {
  const controller = useYoutubePageController();
  return <YoutubePageContent {...controller} />;
}
