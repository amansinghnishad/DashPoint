const asString = (value) => (typeof value === "string" ? value : "");

export const normalizeTodoListData = (data) => {
  const items = Array.isArray(data?.items)
    ? data.items.map((it) => ({
        done: Boolean(it?.done),
        text: asString(it?.text),
      }))
    : [];

  return { items };
};

export const normalizeAppointmentsData = (data) => {
  const items = Array.isArray(data?.items)
    ? data.items.map((it) => ({
        title: asString(it?.title),
        when: asString(it?.when),
      }))
    : [];

  return { items };
};

export const normalizeDailyScheduleData = (data) => {
  const blocks = Array.isArray(data?.blocks)
    ? data.blocks.map((b) => ({
        start: asString(b?.start),
        end: asString(b?.end),
        title: asString(b?.title),
      }))
    : [];

  return { blocks };
};

export const normalizeNotesData = (data) => ({
  text: asString(data?.text),
});
