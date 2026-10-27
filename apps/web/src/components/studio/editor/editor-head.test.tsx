import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EditorProvider } from "./editor-context";
import { BackToAlbums } from "./editor-head";
import type { AlbumEditorState } from "./use-album-editor";

const pressLeave = vi.fn();

function renderBack(): HTMLElement {
  const editor = { backHref: "/studio?q=benali", actions: { pressLeave } };
  render(
    <EditorProvider value={editor as unknown as AlbumEditorState}>
      <BackToAlbums />
    </EditorProvider>,
  );
  return screen.getByRole("link", { name: "All albums" });
}

afterEach(() => {
  cleanup();
  pressLeave.mockClear();
});

describe("the way back to the dashboard", () => {
  it("is a link to the dashboard as it was left", () => {
    expect(renderBack().getAttribute("href")).toBe("/studio?q=benali");
  });

  it("leaves through the editor on a plain click, so edits are asked about first", () => {
    const click = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
    renderBack().dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    expect(pressLeave).toHaveBeenCalledOnce();
  });

  it("leaves a click that opens a new tab to the browser", () => {
    fireEvent.click(renderBack(), { metaKey: true });
    expect(pressLeave).not.toHaveBeenCalled();
  });
});
