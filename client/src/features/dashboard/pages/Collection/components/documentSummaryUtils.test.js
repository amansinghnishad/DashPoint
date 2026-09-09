import { describe, expect, it } from "vitest";

import { isPdfFile } from "./documentSummaryUtils";

describe("documentSummaryUtils Unit Tests", () => {
  it("should detect PDF files by MIME type or extension", () => {
    expect(isPdfFile({ type: "application/pdf", name: "doc" })).toBe(true);
    expect(isPdfFile({ type: "", name: "report.pdf" })).toBe(true);
    expect(isPdfFile({ type: "image/png", name: "img.png" })).toBe(false);
    expect(isPdfFile(null)).toBe(false);
  });
});
