import { describe, expect, it } from "vitest";

import { getStreamStepSize, sanitizeMessageForSubmit } from "./chatBar.utils";

describe("Chat Bar Utilities", () => {
  describe("sanitizeMessageForSubmit", () => {
    it("should trim surrounding whitespace and normalize internal whitespace", () => {
      const input = "   Hello   world!  How are you?   ";
      const sanitized = sanitizeMessageForSubmit(input);
      expect(sanitized).toBe("Hello world! How are you?");
    });

    it("should return empty string for null, undefined, or purely whitespace input", () => {
      expect(sanitizeMessageForSubmit("")).toBe("");
      expect(sanitizeMessageForSubmit("     ")).toBe("");
      expect(sanitizeMessageForSubmit(null)).toBe("");
      expect(sanitizeMessageForSubmit(undefined)).toBe("");
    });
  });

  describe("getStreamStepSize", () => {
    it("should compute appropriate chunk step size based on text length", () => {
      expect(getStreamStepSize(50)).toBeGreaterThanOrEqual(1);
      expect(getStreamStepSize(500)).toBeGreaterThan(getStreamStepSize(50));
    });
  });
});
