const getRawCollections = (response) =>
  response?.data?.collections ?? response?.data?.data?.collections ?? [];

const getRawTotal = (response) =>
  response?.data?.pagination?.total ?? response?.data?.data?.pagination?.total;

export const getCollectionsFromResponse = (response) => {
  if (response?.success === false) return [];
  const list = getRawCollections(response);
  return Array.isArray(list) ? list : [];
};

export const getCollectionsPayload = (response) => {
  const collections = getCollectionsFromResponse(response);
  const total = getRawTotal(response);
  const resolvedTotal =
    typeof total === "number" && Number.isFinite(total) ? total : collections.length;

  return { collections, total: resolvedTotal };
};

export const getCollectionPickerOptions = (response) =>
  getCollectionsFromResponse(response)
    .map((collection) => {
      const id = String(collection?._id || collection?.id || "").trim();
      if (!id) return null;

      return {
        id,
        name: String(collection?.name || "Untitled").trim() || "Untitled",
      };
    })
    .filter(Boolean);
