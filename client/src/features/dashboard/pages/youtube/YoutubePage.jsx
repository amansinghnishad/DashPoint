import { useEffect } from "react";
import YoutubePageContent from "./components/YoutubePageContent";
import useYoutubePageController from "./hooks/useYoutubePageController";

export default function YoutubePage({ triggerRef, searchTriggerRef }) {
  const controller = useYoutubePageController();
  const { dispatchUi, dispatchSearch } = controller;

  useEffect(() => {
    if (triggerRef) {
      triggerRef.current = () => dispatchUi({ type: "SET_ADDING", payload: true });
    }
    return () => {
      if (triggerRef) triggerRef.current = null;
    };
  }, [triggerRef, dispatchUi]);

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
