import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import InteractiveCapabilities from "./InteractiveCapabilities";

describe("InteractiveCapabilities Component Unit Tests", () => {
  it("should render tabs and section header", () => {
    render(
      <BrowserRouter>
        <InteractiveCapabilities />
      </BrowserRouter>,
    );

    expect(screen.getByText("An Operable Journal of Workflow")).toBeInTheDocument();
    expect(screen.getAllByText("AI Chat & Tool Execution").length).toBeGreaterThan(0);
    expect(screen.getByText("Smart Calendar & Scheduling")).toBeInTheDocument();
    expect(screen.getByText("Spatial Canvas & Widgets")).toBeInTheDocument();
    expect(screen.getByText("Video Transcripts & Insights")).toBeInTheDocument();
  });

  it("should switch tabs when clicked and display live interactive screens", async () => {
    render(
      <BrowserRouter>
        <InteractiveCapabilities />
      </BrowserRouter>,
    );

    // Switch to Calendar tab
    const calendarTab = screen.getByRole("button", { name: /Smart Calendar & Scheduling/i });
    fireEvent.click(calendarTab);
    expect(await screen.findByText(/August 25, 2026/i)).toBeInTheDocument();

    // Switch to Spatial Canvas tab
    const canvasTab = screen.getByRole("button", { name: /Spatial Canvas & Widgets/i });
    fireEvent.click(canvasTab);
    expect(await screen.findByText(/Sprint Deliverables/i)).toBeInTheDocument();

    // Switch to Content Hub tab
    const contentHubTab = screen.getByRole("button", { name: /Video Transcripts & Insights/i });
    fireEvent.click(contentHubTab);
    expect(await screen.findByText(/Building Agentic Systems with LLMs/i)).toBeInTheDocument();
  });
});
