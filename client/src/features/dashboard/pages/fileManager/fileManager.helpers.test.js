import { describe, expect, it } from "vitest";

import {
  getUploadValidationMessage,
  isTextPreviewable,
  mergeUploadedItems,
  resolveFileUrl,
  toFileItem,
  toFileItems,
} from "./fileManager.helpers";

describe("fileManager.helpers Unit Tests", () => {
  it("should resolve remote and relative file URLs", () => {
    expect(resolveFileUrl("https://cloudinary.com/img.png")).toBe("https://cloudinary.com/img.png");
    expect(resolveFileUrl("/uploads/file.pdf", "http://localhost:5000")).toBe("http://localhost:5000/uploads/file.pdf");
    expect(resolveFileUrl(null)).toBeNull();
  });

  it("should transform backend file records to UI file items", () => {
    const file = {
      _id: "f1",
      originalName: "report.pdf",
      formattedSize: "2.4 MB",
      mimetype: "application/pdf",
      url: "https://cdn.com/report.pdf",
    };

    const item = toFileItem(file);
    expect(item.id).toBe("f1");
    expect(item.title).toBe("report.pdf");
    expect(item.mime).toBe("application/pdf");
    expect(item.remoteUrl).toBe("https://cdn.com/report.pdf");
  });

  it("should convert array of files and filter empty IDs", () => {
    const files = [{ _id: "f1" }, { originalName: "no-id" }];
    const items = toFileItems(files);
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe("f1");
  });

  it("should identify text previewable MIME types", () => {
    expect(isTextPreviewable("text/plain")).toBe(true);
    expect(isTextPreviewable("application/json")).toBe(true);
    expect(isTextPreviewable("image/png")).toBe(false);
    expect(isTextPreviewable(null)).toBe(false);
  });

  it("should validate upload counts", () => {
    expect(getUploadValidationMessage([])).toBe("Choose at least one file.");
    expect(getUploadValidationMessage(new Array(15).fill({}))).toBe(
      "You can upload up to 10 files at a time.",
    );
    expect(getUploadValidationMessage([{}])).toBeNull();
  });

  it("should merge uploaded items and deduplicate existing IDs", () => {
    const current = [{ id: "1", title: "Existing" }];
    const uploaded = [{ id: "1", title: "Duplicate" }, { id: "2", title: "New" }];

    const merged = mergeUploadedItems(current, uploaded);
    expect(merged).toHaveLength(2);
    expect(merged[0].id).toBe("2");
  });
});
