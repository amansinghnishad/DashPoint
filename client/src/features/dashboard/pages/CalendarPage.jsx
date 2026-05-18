import { useCallback, useMemo } from "react";

import CalendarAgendaPanel from "./calendar/components/CalendarAgendaPanel";
import CalendarHeader from "./calendar/components/CalendarHeader";
import CalendarMonthGrid from "./calendar/components/CalendarMonthGrid";
import CreateCalendarItemModal from "./calendar/components/CreateCalendarItemModal";
import { WEEKDAYS } from "./calendar/constants";
import { useCalendarCreateItem } from "./calendar/hooks/useCalendarCreateItem";
import { useCalendarMonthData } from "./calendar/hooks/useCalendarMonthData";
import { dayKey } from "./calendar/utils/dateUtils";
import { useCalendar } from "../../../hooks/useCalendar";

export default function CalendarPage() {
  const today = useMemo(() => new Date(), []);

  const {
    selectedDate,
    setSelectedDate,
    connected,
    loadingStatus,
    error: connectError,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
    refreshStatus,
  } = useCalendar({ loadEvents: false });

  const {
    month,
    monthLabel,
    monthGrid,
    monthLoading,
    monthError,
    setMonthError,
    eventsByDay,
    goToToday,
    goToPreviousMonth,
    goToNextMonth,
    loadMonthEvents,
  } = useCalendarMonthData({
    connected,
    selectedDate,
    setSelectedDate,
  });

  const selectedDayEvents = useMemo(() => {
    const key = dayKey(selectedDate);
    return eventsByDay.get(key) || [];
  }, [eventsByDay, selectedDate]);

  const {
    createOpen,
    creating,
    form,
    isTimedEvent,
    openCreate,
    closeCreate,
    updateFormField,
    submitCreate,
  } = useCalendarCreateItem({
    connected,
    selectedDate,
    onCreated: loadMonthEvents,
    onError: setMonthError,
  });

  const onRefresh = useCallback(async () => {
    const status = await refreshStatus();
    const isConnected = Boolean(status?.data?.connected);
    await loadMonthEvents({ connected: isConnected });
  }, [loadMonthEvents, refreshStatus]);

  return (
    <section className="relative overflow-hidden rounded-3xl border dp-border dp-surface p-4 lg:p-6">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-16 -left-8 h-36 w-36 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute -bottom-16 right-8 h-44 w-44 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <CalendarHeader
        monthLabel={monthLabel}
        selectedDate={selectedDate}
        connected={connected}
        loadingStatus={loadingStatus}
        connectError={connectError}
        monthError={monthError}
        monthLoading={monthLoading}
        onConnect={connectGoogleCalendar}
        onDisconnect={disconnectGoogleCalendar}
        onOpenCreate={openCreate}
        onRefresh={onRefresh}
        onGoToToday={goToToday}
        onGoToPreviousMonth={goToPreviousMonth}
        onGoToNextMonth={goToNextMonth}
      />

      <div className="relative z-10 mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <CalendarMonthGrid
            month={month}
            monthGrid={monthGrid}
            weekdays={WEEKDAYS}
            selectedDate={selectedDate}
            today={today}
            eventsByDay={eventsByDay}
            onSelectDate={setSelectedDate}
          />
        </div>

        <div>
          <CalendarAgendaPanel
            connected={connected}
            selectedDate={selectedDate}
            selectedDayEvents={selectedDayEvents}
            onOpenCreate={openCreate}
          />
        </div>
      </div>

      <CreateCalendarItemModal
        open={createOpen}
        onClose={closeCreate}
        creating={creating}
        onSubmit={submitCreate}
        form={form}
        isTimedEvent={isTimedEvent}
        onChangeField={updateFormField}
      />
    </section>
  );
}
