import { useCallback, useMemo, useEffect } from "react";

import CalendarAgendaPanel from "./calendar/components/CalendarAgendaPanel";
import CalendarHeader from "./calendar/components/CalendarHeader";
import CalendarMonthGrid from "./calendar/components/CalendarMonthGrid";
import CreateCalendarItemModal from "./calendar/components/CreateCalendarItemModal";
import { WEEKDAYS } from "./calendar/constants";
import { useCalendarCreateItem } from "./calendar/hooks/useCalendarCreateItem";
import { useCalendarMonthData } from "./calendar/hooks/useCalendarMonthData";
import { dayKey } from "./calendar/utils/dateUtils";
import { useCalendar } from "../../../hooks/useCalendar";

export default function CalendarPage({ triggerRef }) {
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

  // Wire up the header create trigger ref
  useEffect(() => {
    if (triggerRef) {
      triggerRef.current = () => openCreate();
    }
    return () => {
      if (triggerRef) triggerRef.current = null;
    };
  }, [triggerRef, openCreate]);

  const onRefresh = useCallback(async () => {
    const status = await refreshStatus();
    const isConnected = Boolean(status?.data?.connected);
    await loadMonthEvents({ connected: isConnected });
  }, [loadMonthEvents, refreshStatus]);

  return (
    <section className="w-full max-w-[1024px] mx-auto py-4 relative">
      {/* Breadcrumbs matching layout */}
      <div className="text-[12px] text-muted-soft tracking-wider flex items-center gap-1.5 font-medium mb-3 select-none">
        <span className="opacity-70">INTELLIGENCE LAYER</span>
        <span className="opacity-30">/</span>
        <span className="opacity-70 font-semibold text-ink">AGENDA</span>
      </div>

      <div className="mb-8 min-w-0">
        <h2 className="font-waldenburg-light text-5xl text-ink leading-tight select-none">
          Calendar
        </h2>
      </div>

      {/* Modern styled Calendar Header */}
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

      <div className="relative z-10 mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main Grid View */}
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

        {/* Agenda details */}
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
