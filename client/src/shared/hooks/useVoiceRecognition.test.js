import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import useVoiceRecognition from "./useVoiceRecognition";

describe("useVoiceRecognition Hook Unit Tests", () => {
  it("should initialize with default states", () => {
    const { result } = renderHook(() => useVoiceRecognition());
    expect(result.current.isListening).toBe(false);
    expect(result.current.transcript).toBe("");
    expect(result.current.interimTranscript).toBe("");
  });

  it("should report unsupported in environments without Web Speech API", () => {
    const { result } = renderHook(() => useVoiceRecognition());
    act(() => {
      result.current.startListening();
    });

    if (!result.current.isSupported) {
      expect(result.current.error).toContain("not supported");
    }
  });

  it("should reset transcript", () => {
    const { result } = renderHook(() => useVoiceRecognition());
    act(() => {
      result.current.setTranscript("Testing transcript");
    });
    expect(result.current.transcript).toBe("Testing transcript");

    act(() => {
      result.current.resetTranscript();
    });
    expect(result.current.transcript).toBe("");
  });
});
