import { extractYouTubeId } from "../../../../../shared/lib/urlUtils";

export const ACTION_ERRORS = {
  addItem: "Failed to add item to collection",
  createItem: "Failed to create item",
  upload: "Failed to upload files",
};

// Error parse
export const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

// Error detail
export const getValidationMessage = (error, fallback) => {
  const status = error?.response?.status;
  const responseData = error?.response?.data;

  if (status !== 400 || !Array.isArray(responseData?.errors)) {
    return getErrorMessage(error, fallback);
  }

  const first = responseData.errors[0];
  return first?.msg || first?.message || getErrorMessage(error, fallback);
};

// Thumb pick
export const getYouTubeThumbnail = (details) =>
  details?.thumbnail?.maxres ||
  details?.thumbnail?.high ||
  details?.thumbnail?.medium ||
  details?.thumbnail?.default ||
  null;

// Planner create
export const createPlannerWidgetRecord = async ({
  plannerWidgetsAPI,
  widgetType,
  title,
  data,
}) => {
  const createResponse = await plannerWidgetsAPI.create({
    widgetType,
    title: title || undefined,
    data,
  });

  if (!createResponse?.success) {
    throw new Error(createResponse?.message || "Failed to create planner widget");
  }

  const createdWidget = createResponse.data;
  if (!createdWidget?._id) throw new Error("Create succeeded but missing id");

  return createdWidget;
};

// YouTube create
export const createYouTubeRecord = async ({
  youtubeAPI,
  createYouTubeUrl,
  onWarning,
  onError,
}) => {
  const rawUrl = String(createYouTubeUrl || "").trim();
  if (!rawUrl) {
    onWarning?.("Paste a YouTube link first.");
    return null;
  }

  const videoId = extractYouTubeId(rawUrl);
  if (!videoId) {
    onError?.("Invalid YouTube URL.");
    return null;
  }

  const detailsResponse = await youtubeAPI.getVideoDetails(videoId);
  if (!detailsResponse?.success) {
    throw new Error(detailsResponse?.message || "Failed to fetch video details");
  }

  const details = detailsResponse.data;
  const thumbnail = getYouTubeThumbnail(details);
  if (!thumbnail) throw new Error("Missing thumbnail from YouTube details");

  const saveResponse = await youtubeAPI.create({
    videoId,
    title: (details.title || `YouTube: ${videoId}`).slice(0, 200),
    thumbnail,
    embedUrl: details.embedUrl || `https://www.youtube.com/embed/${videoId}`,
    url: details.url || rawUrl || `https://www.youtube.com/watch?v=${videoId}`,
    channelTitle: details.channelTitle
      ? String(details.channelTitle).slice(0, 100)
      : undefined,
    description: details.description
      ? String(details.description).slice(0, 1000)
      : undefined,
    tags: Array.isArray(details.tags)
      ? details.tags
        .map((tag) => String(tag).trim())
        .filter(Boolean)
        .slice(0, 50)
      : undefined,
  });

  if (!saveResponse?.success) {
    throw new Error(saveResponse?.message || "Failed to save video");
  }

  const savedVideo = saveResponse.data;
  if (!savedVideo?._id) throw new Error("Save succeeded but missing id");

  return savedVideo;
};
