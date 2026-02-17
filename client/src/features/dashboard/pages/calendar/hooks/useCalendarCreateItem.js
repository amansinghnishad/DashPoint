import { useCallback, useEffect, useState } from "react";
import { calendarAPI } from "../../../../../services/modules/calendarApi";
import {
  DASHPOINT_COLOR_TO_GOOGLE_COLOR_ID,
  DEFAULT_CREATE_COLOR,
  DEFAULT_CREATE_END_TIME,
  DEFAULT_CREATE_START_TIME,
  DEFAULT_CREATE_TYPE,
} from "../constants";
import { dayKey } from "../utils/dateUtils";

const createInitialForm = (selectedDate) => ({
  type: DEFAULT_CREATE_TYPE,
  title: "",
  date: dayKey(selectedDate),
  startTime: DEFAULT_CREATE_START_TIME,
  endTime: DEFAULT_CREATE_END_TIME,
  color: DEFAULT_CREATE_COLOR,
});

const buildCreatePayload = (form) => {
  const payload = {
    summary: form.title.trim(),
    dashpointType: form.type,
    dashpointColor: form.color,
    colorId: DASHPOINT_COLOR_TO_GOOGLE_COLOR_ID[form.color] || undefined,
  };

  if (form.type === "todo" || form.type === "task") {
    payload.start = { date: form.date };
    payload.end = { date: form.date };
    return payload;
  }

  const start = new Date(`${form.date}T${form.startTime}:00`);
  const end = new Date(`${form.date}T${form.endTime}:00`);

  payload.start = { dateTime: start.toISOString() };
  payload.end = { dateTime: end.toISOString() };

  return payload;
};

export function useCalendarCreateItem({
  connected,
  selectedDate,
  onCreated,
  onError,
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(() => createInitialForm(selectedDate));

  useEffect(() => {
    setForm((previousForm) => ({
      ...previousForm,
      date: dayKey(selectedDate),
    }));
  }, [selectedDate]);

  const openCreate = useCallback(() => {
    setForm(createInitialForm(selectedDate));
    setCreateOpen(true);
  }, [selectedDate]);

  const closeCreate = useCallback(() => {
    setCreateOpen(false);
  }, []);

  const updateFormField = useCallback((field, value) => {
    setForm((previousForm) => ({ ...previousForm, [field]: value }));
  }, []);

  const validateBeforeCreate = useCallback(() => {
    if (!connected) {
      throw new Error("Connect Google Calendar first.");
    }

    if (!form.title.trim()) {
      throw new Error("Title is required.");
    }

    if (form.type !== "event") {
      return;
    }

    const start = new Date(`${form.date}T${form.startTime}:00`);
    const end = new Date(`${form.date}T${form.endTime}:00`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new Error("Enter a valid start and end time.");
    }

    if (end <= start) {
      throw new Error("End time must be after start time.");
    }
  }, [connected, form]);

  const submitCreate = useCallback(async () => {
    try {
      onError?.(null);
      validateBeforeCreate();
    } catch (validationError) {
      onError?.(validationError);
      return;
    }

    setCreating(true);
    try {
      const payload = buildCreatePayload(form);
      const response = await calendarAPI.createGoogleEvent(payload);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to create");
      }

      setCreateOpen(false);
      await onCreated?.();
    } catch (error) {
      onError?.(error);
    } finally {
      setCreating(false);
    }
  }, [form, onCreated, onError, validateBeforeCreate]);

  return {
    createOpen,
    creating,
    form,
    isTimedEvent: form.type === "event",
    openCreate,
    closeCreate,
    updateFormField,
    submitCreate,
  };
}
