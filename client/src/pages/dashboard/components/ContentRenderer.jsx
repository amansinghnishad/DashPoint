import { StickyNotesContainer as StickyNotes } from "../../../components/sticky-notes";
import { TodoList } from "../../../components/todo/index";
import { YouTubePlayer } from "../../../components/youtube-player";
import { ContentExtractor } from "../../../components/content-extractor";
import { Weather } from "../../../components/weather";
import { Clock } from "../../../components/clock";
import { Collections } from "../../../components/collections/index";
import { OverviewTab, FileManagerTab } from "../../../components/dashboard";

export const ContentRenderer = ({ activeTab }) => {
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />;
      case "collections":
        return <Collections />;
      case "sticky-notes":
        return <StickyNotes />;
      case "todos":
        return <TodoList />;
      case "youtube":
        return <YouTubePlayer />;
      case "content":
        return <ContentExtractor />;
      case "weather":
        return <Weather />;
      case "clock":
        return <Clock />;
      case "files":
        return <FileManagerTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <main className="flex-1 overflow-hidden">
      <div className="h-full p-4 sm:p-6 lg:p-8 overflow-auto">
        {renderContent()}
      </div>
    </main>
  );
};
