import { useCallback, useMemo } from "react";

import CalendarAgendaPanel from "./calendar/components/CalendarAgendaPanel";
import CalendarHeader from "./calendar/components/CalendarHeader";
import CalendarMonthGrid from "./calendar/components/CalendarMonthGrid";
import CreateCalendarItemModal from "./calendar/components/CreateCalendarItemModal";
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
    monthLabel,
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
    <section className="relative mx-auto w-full max-w-[1100px] py-4">
      {/* Modern styled Calendar Header */}
      <CalendarHeader
        monthLabel={monthLabel}
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

      <div className="relative z-10 mt-6 space-y-4">
        <CalendarMonthGrid
          selectedDate={selectedDate}
          today={today}
          eventsByDay={eventsByDay}
          onSelectDate={setSelectedDate}
        />
        <CalendarAgendaPanel
          selectedDayEvents={selectedDayEvents}
        />
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
