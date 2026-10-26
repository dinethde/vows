import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PhotoSlot } from "./photo-slot";

const image = new File(["x"], "first-look.jpg", { type: "image/jpeg" });

function picker(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector<HTMLInputElement>('input[type="file"]');
  if (input === null) throw new Error("the slot has no file input");
  return input;
}

describe("PhotoSlot", () => {
  it("is a button named for what it does and which slot it is", () => {
    render(<PhotoSlot state="Empty" number={3} total={18} />);

    expect(screen.getByRole("button", { name: "Add photo for slot 3 of 18" })).toHaveTextContent(
      "Add photo",
    );
  });

  it("names a slot that has no number by its subject", () => {
    render(<PhotoSlot state="Empty" subject="the cover" />);

    expect(screen.getByRole("button", { name: "Add photo for the cover" })).toBeInTheDocument();
  });

  it("shows the badge only when it is switched on", () => {
    const { rerender } = render(<PhotoSlot state="Empty" number={3} total={18} />);

    expect(screen.queryByText("3")).not.toBeInTheDocument();

    rerender(<PhotoSlot state="Empty" badge number={3} total={18} />);

    expect(screen.getByText("3")).toHaveAttribute("aria-hidden", "true");
  });

  it("offers images only and hands over the chosen file", async () => {
    const onFiles = vi.fn();
    const { container } = render(<PhotoSlot state="Empty" number={1} onFiles={onFiles} />);

    expect(picker(container)).toHaveAttribute("accept", "image/*");

    await userEvent.upload(picker(container), image);

    expect(onFiles).toHaveBeenCalledWith([image]);
  });

  it("opens the file picker when the box is pressed", async () => {
    const { container } = render(<PhotoSlot state="Empty" number={1} />);
    const open = vi.spyOn(picker(container), "click");

    await userEvent.click(screen.getByRole("button", { name: "Add photo for slot 1" }));

    expect(open).toHaveBeenCalledOnce();
  });

  it("takes a dropped file and dims while one is held over it", () => {
    const onFiles = vi.fn();
    const { container } = render(<PhotoSlot state="Empty" number={1} onFiles={onFiles} />);
    const slot = container.firstElementChild as HTMLElement;

    fireEvent.dragEnter(slot, { dataTransfer: { files: [image] } });

    expect(screen.getByText("Replace")).toBeInTheDocument();

    fireEvent.drop(slot, { dataTransfer: { files: [image] } });

    expect(onFiles).toHaveBeenCalledWith([image]);
    expect(screen.queryByText("Replace")).not.toBeInTheDocument();
  });

  it("reports the real progress and does not open the picker while uploading", async () => {
    const { container } = render(
      <PhotoSlot state="Uploading" number={3} total={18} progress={62} />,
    );
    const open = vi.spyOn(picker(container), "click");
    const button = screen.getByRole("button", { name: "Uploading photo for slot 3 of 18, 62%" });

    await userEvent.click(button);

    expect(button).toHaveTextContent("62%");
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(open).not.toHaveBeenCalled();
  });

  it("shows the photograph with its description once uploaded", () => {
    render(
      <PhotoSlot
        state="Uploaded"
        number={3}
        total={18}
        src="/thumb.avif"
        alt="Benali laughing under the veil"
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByRole("img", { name: "Benali laughing under the veil" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Replace photo for slot 3 of 18" }),
    ).toHaveTextContent("Replace");
  });

  it("takes the photograph out with the cross, without opening the picker", async () => {
    const onRemove = vi.fn();
    const { container } = render(
      <PhotoSlot state="Uploaded" number={3} total={18} src="/thumb.avif" onRemove={onRemove} />,
    );
    const open = vi.spyOn(picker(container), "click");

    await userEvent.click(screen.getByRole("button", { name: "Remove photo from slot 3 of 18" }));

    expect(onRemove).toHaveBeenCalledOnce();
    expect(open).not.toHaveBeenCalled();
  });

  it("has no cross when nothing can be removed", () => {
    render(<PhotoSlot state="Uploaded" number={3} src="/thumb.avif" />);

    expect(screen.queryByRole("button", { name: /Remove/ })).not.toBeInTheDocument();
  });

  it("retries from the whole box after a failure, keeping the file the app holds", async () => {
    const onRetry = vi.fn();
    const { container } = render(
      <PhotoSlot state="Error" number={3} total={18} onRetry={onRetry} />,
    );
    const open = vi.spyOn(picker(container), "click");
    const button = screen.getByRole("button", {
      name: "Upload failed for slot 3 of 18. Try again",
    });

    await userEvent.click(button);

    expect(button).toHaveTextContent("Failed");
    expect(onRetry).toHaveBeenCalledOnce();
    expect(open).not.toHaveBeenCalled();
  });

  it("can be reached and pressed from the keyboard", async () => {
    const onRetry = vi.fn();
    render(<PhotoSlot state="Error" number={1} onRetry={onRetry} />);

    await userEvent.tab();
    await userEvent.keyboard("{Enter}");

    expect(onRetry).toHaveBeenCalledOnce();
  });
});
