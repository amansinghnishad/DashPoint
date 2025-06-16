/**
 * Get icon component for different item types
 */
export const getItemTypeIcon = (itemType, size = 14) => {
  const iconProps = { size };

  switch (itemType) {
    case "youtube":
      return { ...iconProps, className: "text-red-500" };
    case "content":
      return { ...iconProps, className: "text-blue-500" };
    case "sticky-note":
      return { ...iconProps, className: "text-yellow-500" };
    case "todo":
      return { ...iconProps, className: "text-green-500" };
    default:
      return { ...iconProps, className: "text-gray-500" };
  }
};

/**
 * Count items by type in a collection
 */
export const getItemTypeCounts = (items) => {
  const counts = {};
  items.forEach((item) => {
    counts[item.itemType] = (counts[item.itemType] || 0) + 1;
  });
  return counts;
};

/**
 * Default color palette for collections
 */
export const DEFAULT_COLORS = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
];

/**
 * Process form tags input into array
 */
export const processTags = (tagsString) => {
  return tagsString
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag);
};

/**
 * Format collection for display
 */
export const formatCollectionData = (formData) => {
  return {
    ...formData,
    tags: processTags(formData.tags),
  };
};
