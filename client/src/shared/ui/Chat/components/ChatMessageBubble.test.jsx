import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ChatMessageBubble from "./ChatMessageBubble";

describe("ChatMessageBubble Component Unit Tests", () => {
  it("should render user message bubble", () => {
    const entry = { role: "user", content: "What is my agenda today?" };
    render(<ChatMessageBubble entry={entry} />);
    expect(screen.getByText("What is my agenda today?")).toBeInTheDocument();
  });

  it("should render assistant message bubble with metadata tags", () => {
    const entry = {
      role: "assistant",
      content: "You have a meeting at 10 AM.",
      meta: { provider: "gemini", model: "gemini-2.0-flash", routing: { tier: "fast" }, retrieval: { hitCount: 2 } },
    };

    render(<ChatMessageBubble entry={entry} />);
    expect(screen.getByText("DashPoint Intelligence")).toBeInTheDocument();
    expect(screen.getByText("You have a meeting at 10 AM.")).toBeInTheDocument();
    expect(screen.getByText("gemini/gemini-2.0-flash")).toBeInTheDocument();
    expect(screen.getByText("fast")).toBeInTheDocument();
    expect(screen.getByText("2 context")).toBeInTheDocument();
  });

  it("should render loading pending state bubble", () => {
    const entry = { role: "assistant", status: "loading", content: "" };
    render(<ChatMessageBubble entry={entry} />);
    expect(screen.getByText("Thinking...")).toBeInTheDocument();
  });
});
