export const getPickerCollectionItemType = (tool) => {
  if (tool === "youtube") return "youtube";
  if (tool === "file") return "file";
  if (tool === "photo") return "file";
  if (tool === "planner") return "planner";
  return null;
};

export const getPickerItemId = (it) => it?._id || it?.id || null;

export const getPickerItemLabel = (tool, it) => {
  if (tool === "youtube") {
    return {
      title: it?.title || "Untitled",
      subtitle: it?.channelTitle || "YouTube",
    };
  }

  if (tool === "planner") {
    const widgetType = String(it?.widgetType || "");
    const typeLabelByType = {
      "top-priorities": "Top Priorities",
      "todo-list": "To do list",
      appointments: "Appointments",
      "daily-schedule": "Daily schedule",
      goals: "Goals",
      "notes-tomorrow": "Notes",
    };

    const typeLabel = typeLabelByType[widgetType] || widgetType || "Planner";

    return {
      title: it?.title || typeLabel,
      subtitle: typeLabel,
    };
  }

  return {
    title: it?.originalName || it?.filename || "File",
    subtitle: it?.formattedSize || it?.mimetype || "",
  };
};

export const toSingleLine = (value) =>
  String(value || "")
    .replace(/\s*\r?\n\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
