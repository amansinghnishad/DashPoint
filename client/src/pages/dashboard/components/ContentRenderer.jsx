import { YouTubePlayer } from "../../../components/youtube-player";
import { ContentExtractor } from "../../../components/content-extractor";
import { Collections } from "../../../components/collections/index";
import { OverviewTab, FileManagerTab } from "./";

export const ContentRenderer = ({ activeTab }) => {
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />;
      case "collections":
        return <Collections />;
      case "youtube":
        return <YouTubePlayer />;
      case "content":
        return <ContentExtractor />;
      case "files":
        return <FileManagerTab />;
      default:
        return <OverviewTab />;
    }
  };
  return (
    <main className="flex-1 overflow-hidden">
      <div className="h-full p-4 sm:p-6 lg:p-8 overflow-auto scrollable-area">
        {renderContent()}
      </div>
    </main>
  );
};
