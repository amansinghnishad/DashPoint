import { useCallback, useEffect, useMemo, useState } from "react";
import { calendarAPI } from "../../../../../services/modules/calendarApi";
import {
  buildMonthGrid,
  createMonthIsoRange,
  formatMonthLabel,
  startOfMonth,
} from "../utils/dateUtils";
import { groupEventsByDay } from "../utils/eventUtils";

export function useCalendarMonthData({ connected, selectedDate, setSelectedDate }) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [monthEvents, setMonthEvents] = useState([]);
  const [monthLoading, setMonthLoading] = useState(false);
  const [monthError, setMonthError] = useState(null);

  useEffect(() => {
    const isInVisibleMonth =
      selectedDate.getFullYear() === month.getFullYear() &&
      selectedDate.getMonth() === month.getMonth();

    if (!isInVisibleMonth) {
      setSelectedDate(new Date(month.getFullYear(), month.getMonth(), 1));
    }
  }, [month, selectedDate, setSelectedDate]);

  const monthRange = useMemo(() => createMonthIsoRange(month), [month]);

  const loadMonthEvents = useCallback(
    async ({ connected: connectedOverride } = {}) => {
      const isConnected =
        typeof connectedOverride === "boolean" ? connectedOverride : connected;

      if (!isConnected) {
        setMonthLoading(false);
        setMonthEvents([]);
        setMonthError(null);
        return;
      }

      setMonthLoading(true);
      setMonthError(null);

      try {
        const response = await calendarAPI.listGoogleEvents(monthRange);
        const events = response?.data?.events || [];
        setMonthEvents(Array.isArray(events) ? events : []);
      } catch (error) {
        setMonthEvents([]);
        setMonthError(error);
      } finally {
        setMonthLoading(false);
      }
    },
    [connected, monthRange]
  );

  useEffect(() => {
    loadMonthEvents();
  }, [loadMonthEvents]);

  const monthGrid = useMemo(() => buildMonthGrid(month), [month]);
  const monthLabel = useMemo(() => formatMonthLabel(month), [month]);
  const eventsByDay = useMemo(() => groupEventsByDay(monthEvents), [monthEvents]);

  const goToToday = useCallback(() => {
    setMonth(startOfMonth(new Date()));
  }, []);

  const goToPreviousMonth = useCallback(() => {
    setMonth((previousMonth) =>
      startOfMonth(
        new Date(previousMonth.getFullYear(), previousMonth.getMonth() - 1, 1)
      )
    );
  }, []);

  const goToNextMonth = useCallback(() => {
    setMonth((previousMonth) =>
      startOfMonth(
        new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 1)
      )
    );
  }, []);

  return {
    month,
    monthLabel,
    monthGrid,
    monthEvents,
    monthLoading,
    monthError,
    setMonthError,
    eventsByDay,
    goToToday,
    goToPreviousMonth,
    goToNextMonth,
    loadMonthEvents,
  };
}
