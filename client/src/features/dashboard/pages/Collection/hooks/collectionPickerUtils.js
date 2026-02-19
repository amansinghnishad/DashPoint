const PICKER_ITEM_TYPE_BY_TOOL = {
  youtube: "youtube",
  file: "file",
  photo: "file",
  planner: "planner",
};

const PLANNER_TYPE_LABELS = {
  "todo-list": "To do list",
  appointments: "Appointments",
  "daily-schedule": "Daily schedule",
  notes: "Notes",
  "notes-tomorrow": "Notes",
};

const getPlannerTypeLabel = (widgetType) => {
  const safeWidgetType = String(widgetType || "");
  return PLANNER_TYPE_LABELS[safeWidgetType] || safeWidgetType || "Planner";
};

// Tool mapping
export const getPickerCollectionItemType = (tool) => {
  const safeTool = String(tool || "");
  return PICKER_ITEM_TYPE_BY_TOOL[safeTool] || null;
};

// Item identity
export const getPickerItemId = (item) => item?._id || item?.id || null;

// Item labeling
export const getPickerItemLabel = (tool, item) => {
  if (tool === "youtube") {
    return {
      title: item?.title || "Untitled",
      subtitle: item?.channelTitle || "YouTube",
    };
  }

  if (tool === "planner") {
    const typeLabel = getPlannerTypeLabel(item?.widgetType);
    return {
      title: item?.title || typeLabel,
      subtitle: typeLabel,
    };
  }

  return {
    title: item?.originalName || item?.filename || "File",
    subtitle: item?.formattedSize || item?.mimetype || "",
  };
};

// Text normalize
export const toSingleLine = (value) =>
  String(value || "")
    .replace(/\s*\r?\n\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
