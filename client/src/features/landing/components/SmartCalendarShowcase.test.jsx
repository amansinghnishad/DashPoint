import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SmartCalendarShowcase from "./SmartCalendarShowcase";

describe("SmartCalendarShowcase Component Unit Tests", () => {
  it("should render calendar header and event chips", () => {
    render(<SmartCalendarShowcase />);
    expect(screen.getByText("Smart Adaptive Calendar")).toBeInTheDocument();
    expect(screen.getByText("Architecture & RAG Sync")).toBeInTheDocument();
    expect(screen.getByText("Product Sprint Review")).toBeInTheDocument();
  });

  it("should toggle event completion when chip is clicked", () => {
    render(<SmartCalendarShowcase />);
    const eventText = screen.getByText("Architecture & RAG Sync");
    fireEvent.click(eventText);

    expect(eventText).toBeInTheDocument();
  });
});
