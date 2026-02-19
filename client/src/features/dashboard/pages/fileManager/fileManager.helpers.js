import { SERVER_BASE_URL } from "../../../../shared/config/appConfig";

export const FILE_MANAGER_ERRORS = {
  load: "Failed to load files",
  upload: "Failed to upload files",
  delete: "Failed to delete file",
  download: "Failed to download file",
};

export const FILE_MANAGER_ACCEPT =
  "image/*,application/pdf,text/*,.md,.json,.csv";

export const FILE_MANAGER_MAX_UPLOAD_FILES = 10;

export const getRequestErrorMessage = (error, fallback) => {
  const status = error?.response?.status;
  const responseData = error?.response?.data;

  if (status === 400 && Array.isArray(responseData?.errors)) {
    const first = responseData.errors[0];
    return first?.msg || first?.message || fallback;
  }

  return responseData?.message || responseData?.error || error?.message || fallback;
};

export const resolveFileUrl = (url, serverBaseUrl = SERVER_BASE_URL) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${serverBaseUrl}${url}`;
};

export const getFileDownloadUrl = (fileId, serverBaseUrl = SERVER_BASE_URL) => {
  if (!fileId) return null;
  return `${serverBaseUrl}/api/files/${fileId}/download`;
};

export const toFileItem = (file) => ({
  id: file?._id || null,
  title: file?.originalName || "Untitled",
  subtitle: file?.formattedSize || "",
  type: "file",
  mime: file?.mimetype || "",
  remoteUrl: resolveFileUrl(file?.url),
  downloadUrl: getFileDownloadUrl(file?._id),
  _raw: file,
});

export const toFileItems = (files) =>
  (Array.isArray(files) ? files : []).map(toFileItem).filter((item) => item.id);

export const isTextPreviewable = (mime) => {
  if (!mime) return false;
  return (
    mime.startsWith("text/") ||
    mime === "application/json" ||
    mime === "application/xml" ||
    mime === "application/javascript"
  );
};

export const getUploadValidationMessage = (files) => {
  const list = Array.isArray(files) ? files : Array.from(files || []);
  if (!list.length) return "Choose at least one file.";
  if (list.length > FILE_MANAGER_MAX_UPLOAD_FILES) {
    return `You can upload up to ${FILE_MANAGER_MAX_UPLOAD_FILES} files at a time.`;
  }
  return null;
};

export const mergeUploadedItems = (currentItems, uploadedItems) => {
  const existingIds = new Set((currentItems || []).map((item) => item.id));
  const nextUploads = (uploadedItems || []).filter(
    (item) => !existingIds.has(item.id)
  );
  return [...nextUploads, ...(currentItems || [])];
};
