import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import DeleteConfirmModal from "./DeleteConfirmModal";

describe("DeleteConfirmModal Component Unit Tests", () => {
  it("should render when open is true", () => {
    render(
      <DeleteConfirmModal
        open={true}
        title="Delete Item"
        description="Are you sure?"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByText("Delete Item")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  it("should trigger onConfirm when delete button is clicked", () => {
    const handleConfirm = vi.fn();
    render(
      <DeleteConfirmModal
        open={true}
        title="Delete"
        onClose={vi.fn()}
        onConfirm={handleConfirm}
      />,
    );

    const deleteBtn = screen.getByRole("button", { name: "Delete" });
    fireEvent.click(deleteBtn);
    expect(handleConfirm).toHaveBeenCalled();
  });
});
