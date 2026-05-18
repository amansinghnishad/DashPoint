export const isPdfFile = (file) => {
  if (!file) return false;
  const mimeType = String(file.type || "").toLowerCase();
  const fileName = String(file.name || "").toLowerCase();
  return mimeType === "application/pdf" || fileName.endsWith(".pdf");
};
