import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Clock from "./Clock";

describe("Clock Component Unit Tests", () => {
  it("should render clock element with aria-label", () => {
    render(<Clock />);
    const clock = screen.getByLabelText("Clock");
    expect(clock).toBeInTheDocument();
  });
});
