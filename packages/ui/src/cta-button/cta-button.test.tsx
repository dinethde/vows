import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CtaButton } from "./cta-button";

describe("CtaButton", () => {
  it("is named by its label alone, with the arrow hidden from assistive technology", () => {
    const { container } = render(<CtaButton>Let’s talk</CtaButton>);

    expect(screen.getByRole("button", { name: "Let’s talk" })).toBeInTheDocument();
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("leaves the arrow out for Send", () => {
    const { container } = render(<CtaButton arrow={false}>Send</CtaButton>);

    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("submits a form only when asked to", () => {
    render(
      <CtaButton arrow={false} type="submit">
        Send
      </CtaButton>,
    );

    expect(screen.getByRole("button", { name: "Send" })).toHaveAttribute("type", "submit");
  });

  it("reports busy and ignores presses while sending", async () => {
    const onClick = vi.fn();
    render(
      <CtaButton arrow={false} pending onClick={onClick}>
        Sending…
      </CtaButton>,
    );
    const button = screen.getByRole("button", { name: "Sending…" });

    await userEvent.click(button);

    expect(button).toHaveAttribute("aria-busy", "true");
    expect(onClick).not.toHaveBeenCalled();
  });

  it("keeps the arrow when it renders the link it is given", () => {
    const { container } = render(
      <CtaButton asChild>
        <a href="/">Back to the albums</a>
      </CtaButton>,
    );
    const link = screen.getByRole("link", { name: "Back to the albums" });

    expect(link).toHaveAttribute("href", "/");
    expect(link.querySelector("svg")).toBe(container.querySelector("svg"));
  });
});
