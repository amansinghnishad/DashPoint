import { useCallback, useEffect, useMemo, useState } from "react";
import { calendarAPI } from "../services/api";

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

export function useCalendar() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [connected, setConnected] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  const selectedRange = useMemo(() => {
    const min = startOfDay(selectedDate);
    const max = endOfDay(selectedDate);
    return { timeMin: min.toISOString(), timeMax: max.toISOString() };
  }, [selectedDate]);

  const refreshStatus = useCallback(async () => {
    setLoadingStatus(true);
    setError(null);
    try {
      const res = await calendarAPI.getGoogleStatus();
      setConnected(Boolean(res?.data?.connected));
      return res;
    } catch (e) {
      setConnected(false);
      setError(e);
      return null;
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  const connectGoogleCalendar = useCallback(async () => {
    setError(null);
    try {
      const res = await calendarAPI.getGoogleAuthUrl("/dashboard");
      const url = res?.data?.url;
      if (!url) {
        throw new Error("Failed to get Google auth URL");
      }
      window.location.assign(url);
      return true;
    } catch (e) {
      setError(e);
      return false;
    }
  }, []);

  const disconnectGoogleCalendar = useCallback(async () => {
    setError(null);
    try {
      await calendarAPI.disconnectGoogleCalendar();
      setConnected(false);
      setEvents([]);
      return true;
    } catch (e) {
      setError(e);
      return false;
    }
  }, []);

  const loadEventsForSelectedDay = useCallback(async () => {
    setLoadingEvents(true);
    setError(null);
    try {
      const res = await calendarAPI.listGoogleEvents(selectedRange);
      const list = res?.data?.events || [];
      setEvents(Array.isArray(list) ? list : []);
      return res;
    } catch (e) {
      setEvents([]);
      setError(e);
      return null;
    } finally {
      setLoadingEvents(false);
    }
  }, [selectedRange]);

  // Initial status load + refresh after OAuth redirect
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // Load events whenever connected/selectedDate changes
  useEffect(() => {
    if (!connected) {
      setEvents([]);
      return;
    }
    loadEventsForSelectedDay();
  }, [connected, loadEventsForSelectedDay]);

  return {
    selectedDate,
    setSelectedDate,
    connected,
    loadingStatus,
    loadingEvents,
    events,
    error,
    refreshStatus,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
    reloadEvents: loadEventsForSelectedDay
  };
}

