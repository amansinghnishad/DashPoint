import { beforeEach, describe, expect, it } from "vitest";

import { getPreferredTheme, initTheme, setTheme } from "./theme";

describe("theme Unit Tests", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should default to dark theme when no stored preference exists", () => {
    expect(getPreferredTheme()).toBe("dark");
  });

  it("should persist and apply light theme", () => {
    setTheme("light");
    expect(getPreferredTheme()).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("should initialize theme on app startup", () => {
    setTheme("dark");
    initTheme();
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});
