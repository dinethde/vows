import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Banner } from "./banner";

describe("Banner", () => {
  it("announces unsaved changes politely", () => {
    render(<Banner state="Unsaved">Unsaved changes — publish to put them on the website.</Banner>);
    const banner = screen.getByRole("status");

    expect(banner).toHaveTextContent("Unsaved changes — publish to put them on the website.");
    expect(banner).toHaveAttribute("aria-live", "polite");
  });

  it("announces a save politely", () => {
    render(<Banner state="Saved">Saved. The album page is rebuilding.</Banner>);

    expect(screen.getByRole("status")).toHaveTextContent("Saved. The album page is rebuilding.");
  });

  it("interrupts for a failure", () => {
    render(<Banner state="Error">The cover is too large. Choose a file under 40 MB.</Banner>);
    const banner = screen.getByRole("alert");

    expect(banner).toHaveTextContent("The cover is too large. Choose a file under 40 MB.");
    expect(banner).toHaveAttribute("aria-live", "assertive");
  });

  it("keeps the same element when the state changes, so the change is heard", () => {
    const { rerender } = render(<Banner state="Unsaved">Unsaved changes.</Banner>);
    const before = screen.getByText("Unsaved changes.");

    rerender(<Banner state="Saved">Saved.</Banner>);

    expect(screen.getByText("Saved.")).toBe(before);
  });
});
