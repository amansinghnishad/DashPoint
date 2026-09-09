import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import useApiRequest from "./useApiRequest";

describe("useApiRequest Hook Unit Tests", () => {
  it("should initialize with default states", () => {
    const { result } = renderHook(() => useApiRequest());
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("");
  });

  it("should handle successful execution and set loading state", async () => {
    const { result } = renderHook(() => useApiRequest());
    const mockRequest = () => Promise.resolve({ data: "ok" });

    let response;
    await act(async () => {
      response = await result.current.run(mockRequest);
    });

    expect(response).toEqual({ data: "ok" });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("");
  });

  it("should capture and format request error messages", async () => {
    const { result } = renderHook(() => useApiRequest());
    const mockFail = () =>
      Promise.reject({
        response: { data: { message: "Server validation error" } },
      });

    let response;
    await act(async () => {
      response = await result.current.run(mockFail);
    });

    expect(response).toBeNull();
    expect(result.current.error).toBe("Server validation error");
    expect(result.current.loading).toBe(false);
  });
});
