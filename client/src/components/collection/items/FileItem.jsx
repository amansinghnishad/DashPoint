import {
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import fileService from "../../../services/fileService";

export const FileItem = ({ item, className = "" }) => {
  const file = item?.itemData;
  if (!file) {
    return (
      <div
        className={`w-full h-full bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
      >
        <div className="text-center text-gray-500">
          <FileText size={32} className="mx-auto mb-2" />
          <p className="text-sm">File not found</p>
        </div>
      </div>
    );
  }

  const isImage = String(file.mimetype || "").startsWith("image/");

  if (isImage && file.url) {
    return (
      <div
        className={`w-full h-full rounded-lg overflow-hidden bg-gray-100 ${className}`}
      >
        <img
          src={file.url}
          alt={file.originalName || file.filename || "Image"}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className={`w-full h-full bg-gray-50 rounded-lg p-4 ${className}`}>
      <div className="h-full flex flex-col">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
            {isImage ? (
              <ImageIcon size={18} className="text-gray-700" />
            ) : (
              <FileText size={18} className="text-gray-700" />
            )}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">
              {file.originalName || file.filename}
            </div>
            <div className="text-xs text-gray-500">
              {file.formattedSize || fileService.formatFileSize(file.size || 0)}
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4 flex items-center gap-2">
          {file.url && (
            <a
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm text-gray-700"
            >
              <ExternalLink size={16} />
              Open
            </a>
          )}
          {file.url && (
            <a
              href={file.url}
              download
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm text-gray-700"
            >
              <Download size={16} />
              Download
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
