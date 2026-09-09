import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import TopBar from "./TopBar";

describe("TopBar Component Unit Tests", () => {
  it("should render brand and navigation links", () => {
    render(
      <BrowserRouter>
        <TopBar />
      </BrowserRouter>,
    );

    expect(screen.getByText("DASHPOINT")).toBeInTheDocument();
    expect(screen.getByText("Capabilities")).toBeInTheDocument();
    expect(screen.getByText("Manifesto")).toBeInTheDocument();
    expect(screen.getByText("Sign In")).toBeInTheDocument();
    expect(screen.getByText("Try free")).toBeInTheDocument();
  });

  it("should trigger hover on navigation items", () => {
    render(
      <BrowserRouter>
        <TopBar />
      </BrowserRouter>,
    );

    const capabilitiesLink = screen.getByText("Capabilities");
    fireEvent.mouseEnter(capabilitiesLink);
    expect(capabilitiesLink).toBeInTheDocument();
  });
});
