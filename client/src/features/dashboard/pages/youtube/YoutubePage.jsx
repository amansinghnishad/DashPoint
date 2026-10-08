import { useEffect } from "react";

import YoutubePageContent from "./components/YoutubePageContent";
import useYoutubePageController from "./hooks/useYoutubePageController";

export default function YoutubePage({ searchTriggerRef }) {
  const controller = useYoutubePageController();
  const { dispatchSearch } = controller;

  useEffect(() => {
    if (searchTriggerRef) {
      searchTriggerRef.current = (query) => dispatchSearch({ type: "SET_QUERY", payload: query });
    }
    return () => {
      if (searchTriggerRef) searchTriggerRef.current = null;
    };
  }, [searchTriggerRef, dispatchSearch]);

  return <YoutubePageContent {...controller} />;
}
