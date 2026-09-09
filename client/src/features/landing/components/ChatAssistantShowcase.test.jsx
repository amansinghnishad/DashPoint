import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ChatAssistantShowcase from "./ChatAssistantShowcase";

describe("ChatAssistantShowcase Component Unit Tests", () => {
  it("should render chat assistant header and initial message", () => {
    render(<ChatAssistantShowcase />);
    expect(screen.getAllByText("DashPoint Intelligence").length).toBeGreaterThan(0);
    expect(screen.getByText(/Hello! I'm DashPoint Intelligence/i)).toBeInTheDocument();
  });

  it("should send prompt suggestion when clicked", () => {
    render(<ChatAssistantShowcase />);
    const suggestionBtn = screen.getByText(/Summarize today's product priorities/i);
    fireEvent.click(suggestionBtn);

    expect(screen.getByText("Summarize today's product priorities")).toBeInTheDocument();
  });
});
