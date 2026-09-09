import { describe, expect, it, vi } from "vitest";

import { authAPI } from "./authApi";
import { calendarAPI } from "./calendarApi";
import { collectionsAPI } from "./collectionsApi";
import { contentInsightsAPI } from "./contentInsightsApi";
import fileService from "./fileService";
import { plannerWidgetsAPI } from "./plannerWidgetsApi";
import { universalSearchAPI } from "./universalSearchApi";
import { youtubeAPI } from "./youtubeApi";
import { apiClient } from "../../shared/api/httpClient";

vi.mock("../../shared/api/httpClient", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  API_BASE_URL: "http://localhost:5000/api",
}));

describe("Frontend API Modules Unit Tests", () => {
  it("authAPI should send correct request payloads", async () => {
    apiClient.post.mockResolvedValueOnce({ data: { user: { id: "u1" } } });
    const res = await authAPI.login({ email: "a@b.com", password: "p" });
    expect(apiClient.post).toHaveBeenCalledWith("/auth/login", { email: "a@b.com", password: "p" });
    expect(res).toEqual({ user: { id: "u1" } });
  });

  it("calendarAPI should call calendar endpoints", async () => {
    apiClient.get.mockResolvedValueOnce({ data: { connected: true } });
    const res = await calendarAPI.getGoogleStatus();
    expect(apiClient.get).toHaveBeenCalledWith("/calendar/google/status");
    expect(res.connected).toBe(true);
  });

  it("collectionsAPI should call collections endpoints", async () => {
    apiClient.get.mockResolvedValueOnce({ data: { collections: [] } });
    const res = await collectionsAPI.getCollections(1, 10, "work");
    expect(apiClient.get).toHaveBeenCalledWith("/collections", {
      params: { page: 1, limit: 10, search: "work" },
    });
    expect(res.collections).toEqual([]);
  });

  it("contentInsightsAPI should accept and reject insights", async () => {
    apiClient.post.mockResolvedValueOnce({ data: { status: "accepted" } });
    const res = await contentInsightsAPI.accept("ins-1", { note: "ok" });
    expect(apiClient.post).toHaveBeenCalledWith("/insights/ins-1/accept", { note: "ok" });
    expect(res.status).toBe("accepted");
  });

  it("plannerWidgetsAPI should execute CRUD operations", async () => {
    apiClient.post.mockResolvedValueOnce({ data: { widget: { _id: "w1" } } });
    const res = await plannerWidgetsAPI.create({ title: "Todo", widgetType: "todo-list" });
    expect(apiClient.post).toHaveBeenCalledWith("/planner-widgets", { title: "Todo", widgetType: "todo-list" });
    expect(res.widget._id).toBe("w1");
  });

  it("universalSearchAPI should query search endpoint", async () => {
    apiClient.get.mockResolvedValueOnce({ data: { total: 5, groups: [] } });
    const res = await universalSearchAPI.search("React", 6);
    expect(apiClient.get).toHaveBeenCalledWith("/search", {
      params: { q: "React", limit: 6 },
    });
    expect(res.total).toBe(5);
  });

  it("youtubeAPI should call youtube endpoints", async () => {
    apiClient.post.mockResolvedValueOnce({ data: { video: { id: "y1" } } });
    const res = await youtubeAPI.create({ url: "https://youtu.be/123" });
    expect(apiClient.post).toHaveBeenCalledWith("/youtube/videos", { url: "https://youtu.be/123" });
    expect(res.video.id).toBe("y1");
  });

  it("fileService helper functions should format size and category", () => {
    expect(fileService.formatFileSize(0)).toBe("0 Bytes");
    expect(fileService.formatFileSize(1024)).toBe("1 KB");
    expect(fileService.formatFileSize(1048576)).toBe("1 MB");

    expect(fileService.getFileIcon("application/pdf")).toBe("[PDF]");
    expect(fileService.getFileIcon("image/png")).toBe("[IMG]");
    expect(fileService.getFileIcon("unknown/type")).toBe("[FILE]");

    expect(fileService.getFileCategory("application/pdf")).toBe("pdf");
    expect(fileService.getFileCategory("image/jpeg")).toBe("image");
    expect(fileService.getFileCategory("video/mp4")).toBe("video");
  });
});
