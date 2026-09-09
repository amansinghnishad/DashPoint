import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ErrorBoundary from "./ErrorBoundary";

function BombComponent() {
  throw new Error("Crash");
}

describe("ErrorBoundary Component Unit Tests", () => {
  it("should render children when there is no error", () => {
    render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText("Normal content")).toBeInTheDocument();
  });

  it("should render error recovery screen when child component throws", () => {
    render(
      <ErrorBoundary>
        <BombComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reload Application" })).toBeInTheDocument();
  });
});
