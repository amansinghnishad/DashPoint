export const normalizeTopPrioritiesData = (data) => {
  const rawItems = Array.isArray(data?.items) ? data.items : [];
  const items = rawItems
    .slice(0, 3)
    .map((it) => ({ done: Boolean(it?.done), text: String(it?.text || "") }));

  while (items.length < 3) {
    items.push({ done: false, text: "" });
  }

  return { items };
};

export const normalizeTodoListData = (data) => {
  const rawItems = Array.isArray(data?.items) ? data.items : [];
  const items = rawItems.map((it) => ({
    done: Boolean(it?.done),
    text: String(it?.text || ""),
  }));

  if (!items.length) {
    return {
      items: [
        { done: false, text: "" },
        { done: false, text: "" },
        { done: false, text: "" },
      ],
    };
  }

  return { items };
};

export const normalizeAppointmentsData = (data) => {
  const rawItems = Array.isArray(data?.items) ? data.items : [];
  const items = rawItems.map((it) => ({
    when: String(it?.when || ""),
    title: String(it?.title || ""),
  }));

  if (!items.length) {
    return {
      items: [
        { when: "", title: "" },
        { when: "", title: "" },
      ],
    };
  }

  return { items };
};

export const normalizeDailyScheduleData = (data) => {
  const rawBlocks = Array.isArray(data?.blocks) ? data.blocks : [];
  const blocks = rawBlocks.map((b) => ({
    start: String(b?.start || ""),
    end: String(b?.end || ""),
    title: String(b?.title || ""),
  }));

  if (!blocks.length) {
    return {
      blocks: [
        { start: "", end: "", title: "" },
        { start: "", end: "", title: "" },
        { start: "", end: "", title: "" },
      ],
    };
  }

  return { blocks };
};

export const normalizeGoalsData = (data) => {
  const rawGoals = Array.isArray(data?.goals) ? data.goals : [];
  const goals = rawGoals.map((g) => ({
    done: Boolean(g?.done),
    title: String(g?.title || ""),
    due: String(g?.due || ""),
  }));

  if (!goals.length) {
    return {
      goals: [
        { done: false, title: "", due: "" },
        { done: false, title: "", due: "" },
        { done: false, title: "", due: "" },
      ],
    };
  }

  return { goals };
};

export const normalizeNotesData = (data) => {
  return { text: String(data?.text || "") };
};

export const normalizeMealPlannerData = (data) => {
  const rawItems = Array.isArray(data?.items) ? data.items : [];
  const items = rawItems.map((it) => ({
    day: String(it?.day || ""),
    meal: String(it?.meal || ""),
    text: String(it?.text || ""),
  }));

  if (!items.length) {
    return {
      items: [
        { day: "", meal: "", text: "" },
        { day: "", meal: "", text: "" },
      ],
    };
  }

  return { items };
};

export const normalizeWaterTrackerData = (data) => {
  const count = Number(data?.count);
  return { count: Number.isFinite(count) && count >= 0 ? count : 0 };
};

export const normalizeCallsEmailsData = (data) => {
  const rawItems = Array.isArray(data?.items) ? data.items : [];
  const items = rawItems.map((it) => ({ text: String(it?.text || "") }));

  if (!items.length) {
    return { items: [{ text: "" }, { text: "" }] };
  }

  return { items };
};

export const normalizeExpenseTrackerData = (data) => {
  const rawRows = Array.isArray(data?.rows) ? data.rows : [];
  const rows = rawRows.map((r) => ({
    label: String(r?.label || ""),
    amount: String(r?.amount || ""),
  }));

  if (!rows.length) {
    return {
      rows: [
        { label: "", amount: "" },
        { label: "", amount: "" },
      ],
    };
  }

  return { rows };
};

export const normalizeRateYourDayData = (data) => {
  const rating = Number(data?.rating);
  return {
    rating: Number.isFinite(rating) && rating >= 0 ? Math.min(5, rating) : 0,
    note: String(data?.note || ""),
  };
};
