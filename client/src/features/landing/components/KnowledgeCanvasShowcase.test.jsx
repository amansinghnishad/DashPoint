import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import KnowledgeCanvasShowcase from "./KnowledgeCanvasShowcase";

describe("KnowledgeCanvasShowcase Component Unit Tests", () => {
  it("should render planner todos and voice widget", () => {
    render(<KnowledgeCanvasShowcase />);
    expect(screen.getByText("Infinite Knowledge Canvas")).toBeInTheDocument();
    expect(screen.getByText("Sprint Planner")).toBeInTheDocument();
    expect(screen.getByText("Voice Dictation")).toBeInTheDocument();
  });

  it("should toggle voice recording state", () => {
    render(<KnowledgeCanvasShowcase />);
    const recordBtn = screen.getByRole("button", { name: "Record Note" });
    fireEvent.click(recordBtn);

    expect(screen.getByRole("button", { name: "Listening..." })).toBeInTheDocument();
  });
});
