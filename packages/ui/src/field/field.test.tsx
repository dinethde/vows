import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Field } from "./field";

describe("Field on the site", () => {
  it("uses the placeholder as its name", () => {
    render(<Field surface="site" label="Your name" />);
    const input = screen.getByRole("textbox", { name: "Your name" });

    expect(input).toHaveAttribute("placeholder", "Your name");
  });

  it("keeps what is typed", async () => {
    render(<Field surface="site" label="Your name" />);
    const input = screen.getByRole("textbox", { name: "Your name" });

    await userEvent.type(input, "Benali");

    expect(input).toHaveValue("Benali");
  });

  it("marks a required field for the browser and hides the star from readers", () => {
    const { container } = render(<Field surface="site" label="Email" type="email" required />);

    expect(screen.getByRole("textbox", { name: "Email" })).toBeRequired();
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("ties the error message to the input", () => {
    render(<Field surface="site" label="Email" error="That email address looks incomplete." />);
    const input = screen.getByRole("textbox", { name: "Email" });

    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription("That email address looks incomplete.");
  });

  it("is not invalid without a message", () => {
    render(<Field surface="site" label="Email" />);

    expect(screen.getByRole("textbox", { name: "Email" })).not.toHaveAttribute("aria-invalid");
  });
});

describe("Field in the Studio", () => {
  it("is named by the label above it", () => {
    render(<Field surface="studio" label="Couple names" defaultValue="Benali & Yasiru" />);

    expect(screen.getByLabelText("Couple names")).toHaveValue("Benali & Yasiru");
  });

  it("focuses the input when the label is pressed", async () => {
    render(<Field surface="studio" label="Couple names" />);

    await userEvent.click(screen.getByText("Couple names"));

    expect(screen.getByLabelText("Couple names")).toHaveFocus();
  });

  it("ties the error message to the input", () => {
    render(
      <Field
        surface="studio"
        label="Couple names"
        error="Add the couple’s names. Every album needs a title."
      />,
    );
    const input = screen.getByLabelText("Couple names");

    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription("Add the couple’s names. Every album needs a title.");
  });

  it("becomes a textarea when multiline", async () => {
    render(<Field surface="studio" label="Story" multiline />);
    const story = screen.getByLabelText("Story");

    await userEvent.type(story, "First line{Enter}Second line");

    expect(story.tagName).toBe("TEXTAREA");
    expect(story).toHaveValue("First line\nSecond line");
  });

  it("reads the prefix out with the page address but keeps it out of the value", async () => {
    render(<Field surface="studio" label="Page address" prefix="vows.lk/albums/" />);
    const input = screen.getByLabelText("Page address");

    await userEvent.type(input, "benali-yasiru");

    expect(input).toHaveValue("benali-yasiru");
    expect(input).toHaveAccessibleDescription("vows.lk/albums/");
  });

  it("reads the prefix and the error together", () => {
    render(
      <Field
        surface="studio"
        label="Page address"
        prefix="vows.lk/albums/"
        error="That address is taken."
      />,
    );

    expect(screen.getByLabelText("Page address")).toHaveAccessibleDescription(
      "vows.lk/albums/ That address is taken.",
    );
  });
});
