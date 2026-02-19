import { useCallback, useMemo } from "react";
import { useCalendar } from "../../../hooks/useCalendar";
import { WEEKDAYS } from "./calendar/constants";
import CalendarHeader from "./calendar/components/CalendarHeader";
import CalendarMonthGrid from "./calendar/components/CalendarMonthGrid";
import CalendarSidebar from "./calendar/components/CalendarSidebar";
import CreateCalendarItemModal from "./calendar/components/CreateCalendarItemModal";
import { useCalendarCreateItem } from "./calendar/hooks/useCalendarCreateItem";
import { useCalendarMonthData } from "./calendar/hooks/useCalendarMonthData";

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
    <section className="rounded-3xl border dp-border dp-surface p-6">
      <CalendarHeader
        monthLabel={monthLabel}
        onGoToToday={goToToday}
        onGoToPreviousMonth={goToPreviousMonth}
        onGoToNextMonth={goToNextMonth}
      />

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <CalendarSidebar
          month={month}
          monthLabel={monthLabel}
          monthGrid={monthGrid}
          weekdays={WEEKDAYS}
          selectedDate={selectedDate}
          today={today}
          connected={connected}
          loadingStatus={loadingStatus}
          connectError={connectError}
          monthError={monthError}
          monthLoading={monthLoading}
          onSelectDate={setSelectedDate}
          onOpenCreate={openCreate}
          onConnect={connectGoogleCalendar}
          onDisconnect={disconnectGoogleCalendar}
          onGoToPreviousMonth={goToPreviousMonth}
          onGoToNextMonth={goToNextMonth}
          onRefresh={onRefresh}
        />

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
