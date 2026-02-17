import { apiClient } from "../../shared/api/httpClient";
import { compactParams, getResponseData } from "../../shared/api/httpUtils";

export const fileService = {
  getFiles(params = {}) {
    return getResponseData(
      apiClient.get("/files", {
        params: compactParams(params),
      })
    );
  },

  uploadFiles(files, options = {}) {
    const formData = new FormData();

    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    if (options.tags) formData.append("tags", options.tags);
    if (options.description) formData.append("description", options.description);

    return getResponseData(
      apiClient.post("/files/upload", formData, {
        timeout: 10 * 60 * 1000,
      })
    );
  },

  getFileById(fileId) {
    return getResponseData(apiClient.get(`/files/${fileId}`));
  },

  async downloadFile(fileId, filename) {
    const response = await apiClient.get(`/files/${fileId}/download`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return response.data;
  },

  deleteFile(fileId) {
    return getResponseData(apiClient.delete(`/files/${fileId}`));
  },

  toggleStar(fileId) {
    return getResponseData(apiClient.patch(`/files/${fileId}/star`));
  },

  updateFile(fileId, updates) {
    return getResponseData(apiClient.patch(`/files/${fileId}`, updates));
  },

  getStorageStats() {
    return getResponseData(apiClient.get("/files/stats"));
  },

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const units = ["Bytes", "KB", "MB", "GB", "TB"];
    const index = Math.floor(Math.log(bytes) / Math.log(k));

    return `${Number((bytes / k ** index).toFixed(2))} ${units[index]}`;
  },

  getFileIcon(mimetype = "") {
    if (mimetype.includes("pdf")) return "[PDF]";
    if (mimetype.includes("word") || mimetype.includes("document")) return "[DOC]";
    if (mimetype.includes("excel") || mimetype.includes("sheet")) return "[XLS]";
    if (mimetype.includes("presentation") || mimetype.includes("powerpoint")) {
      return "[PPT]";
    }
    if (mimetype.startsWith("image/")) return "[IMG]";
    if (mimetype.startsWith("video/")) return "[VID]";
    if (mimetype.startsWith("audio/")) return "[AUD]";
    if (mimetype.includes("zip") || mimetype.includes("rar") || mimetype.includes("tar")) {
      return "[ZIP]";
    }
    return "[FILE]";
  },

  getFileCategory(mimetype = "") {
    if (mimetype.startsWith("image/")) return "image";
    if (mimetype.startsWith("video/")) return "video";
    if (mimetype.startsWith("audio/")) return "audio";
    if (mimetype.includes("pdf")) return "pdf";
    if (mimetype.includes("word") || mimetype.includes("document")) return "document";
    if (mimetype.includes("sheet") || mimetype.includes("excel")) return "spreadsheet";
    if (mimetype.includes("presentation") || mimetype.includes("powerpoint")) {
      return "presentation";
    }
    if (mimetype.includes("zip") || mimetype.includes("rar") || mimetype.includes("tar")) {
      return "archive";
    }
    return "other";
  },
};

export default fileService;
