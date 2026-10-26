import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ReactElement } from "react";

import type { StudioAlbum } from "@vows/contracts";
import type * as Ui from "@vows/ui";
import type { ConfirmationModalProps } from "@vows/ui";
import { publishAlbum, saveAlbum } from "@/app/studio/actions";
import { albumWith, fullGallery } from "@/components/studio/fixtures";
import { UploadProvider } from "@/components/studio/shell/upload-context";

import { AlbumEditor } from "./album-editor";

const router = { push: vi.fn(), refresh: vi.fn() };
/** What the API's list answers with when the editor reads the photographs again. */
const listed = vi.hoisted(() => ({ photos: [] as unknown[] }));

vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/app/studio/actions", () => ({
  publishAlbum: vi.fn(),
  saveAlbum: vi.fn(),
  unpublishAlbum: vi.fn(),
  describePhoto: vi.fn(),
  removePhoto: vi.fn(),
  reorderAlbumPhotos: vi.fn(),
}));
vi.mock("@/components/studio/shell/api-context", () => ({
  useApi: () => ({ photos: { list: () => Promise.resolve(listed.photos) } }),
}));
vi.mock("@/components/studio/shell/studio-providers", () => ({ usePortalContainer: () => null }));
/*
 * The real modal is Radix's dialog, which this workspace resolves against a
 * second copy of React under Vitest. It has its own tests in @vows/ui. Here it
 * is a plain stand-in with the same roles, names and buttons.
 */
vi.mock("@vows/ui", async (original) => {
  const ui = await original<typeof Ui>();
  const ConfirmationModal = (props: ConfirmationModalProps): ReactElement | null =>
    props.open ? (
      <div role={props.tone === "danger" ? "alertdialog" : "dialog"} aria-label={props.title}>
        <p>{props.message}</p>
        {props.error ? <p role="alert">{props.error}</p> : null}
        <button type="button" onClick={props.onCancel}>
          Close
        </button>
        <button type="button" onClick={props.onConfirm}>
          {props.confirmLabel}
        </button>
      </div>
    ) : null;
  return { ...ui, ConfirmationModal };
});

/** The edit-first layout, as on a tablet: jsdom has no window width to ask. */
function stubWidth(desktop: boolean): void {
  vi.stubGlobal("matchMedia", () => ({
    matches: desktop,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));
}

function open(album: StudioAlbum, backHref = '/studio'): void {
  listed.photos = album.cover ? [album.cover, ...album.photos] : album.photos;
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } });
  render(
    <QueryClientProvider client={client}>
      <UploadProvider>
        <AlbumEditor album={album} backHref={backHref} />
      </UploadProvider>
    </QueryClientProvider>,
  );
}

const complete = (): StudioAlbum =>
  albumWith(fullGallery(), { coupleNames: "Benali & Yasiru", shotOn: "2022-01-02" });
const publishButton = (): HTMLElement => screen.getAllByRole("button", { name: "Publish" })[0]!;
const field = (label: string): HTMLInputElement => screen.getByLabelText<HTMLInputElement>(label);
const describedBy = (element: HTMLElement): string =>
  (element.getAttribute("aria-describedby") ?? "")
    .split(" ")
    .map((id) => document.getElementById(id)?.textContent ?? "")
    .join(" ");

beforeEach(() => {
  stubWidth(false);
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("the album editor, as opened", () => {
  it("shows no strip and marks nothing", () => {
    open(albumWith([]));
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByRole("alert")?.textContent ?? "").toBe("");
    expect(field("Couple names").getAttribute("aria-invalid")).toBeNull();
  });

  it("keeps Publish focusable and lets it say why it will not go", () => {
    open(albumWith([]));
    const publish = publishButton();
    expect(publish.hasAttribute("disabled")).toBe(false);
    expect(describedBy(publish)).toBe("Publishing is blocked until all 21 things are fixed.");
  });

  it("draws the cover and all 18 numbered slots", () => {
    open(albumWith([]));
    expect(screen.getByRole("button", { name: "Add photo for the cover" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Add photo for slot 18 of 18" })).toBeTruthy();
    expect(screen.getByText("0 of 18 added")).toBeTruthy();
  });

  it("shows the address prefix as vows.lk", () => {
    open(albumWith([]));
    expect(describedBy(field("Page address"))).toContain("vows.lk/albums/");
  });
});

describe("while typing", () => {
  it("says what the active field is for, and that the edits are not live yet", async () => {
    open(albumWith([]));
    await userEvent.click(field("Couple names"));
    await userEvent.keyboard("Benali & Yas");

    expect(describedBy(field("Couple names"))).toBe(
      "This becomes the album’s title on the website.",
    );
    expect(screen.getByRole("status").textContent).toBe(
      "Unsaved changes — publish to put them on the website.",
    );
  });

  it("checks a field when it is left, and clears the error the moment it is right", async () => {
    open(albumWith([]));
    const address = field("Page address");
    await userEvent.clear(address);
    await userEvent.type(address, "Bad Address");
    expect(address.getAttribute("aria-invalid")).toBeNull();

    await userEvent.tab();
    expect(address.getAttribute("aria-invalid")).toBe("true");
    expect(describedBy(address)).toMatch(/lower-case letters, numbers and hyphens/);

    await userEvent.clear(address);
    await userEvent.type(address, "benali-yasiru");
    expect(address.getAttribute("aria-invalid")).toBeNull();
  });
});

describe("pressing Publish on an album that is not ready", () => {
  it("counts the problems, marks them and moves to the first", async () => {
    open(albumWith(fullGallery().filter((photo) => photo.position !== 7)));
    await userEvent.click(publishButton());

    const strip = await screen.findByText("3 things need fixing before this album can go live.");
    expect(strip.getAttribute("role")).toBe("alert");
    const names = field("Couple names");
    expect(names.getAttribute("aria-invalid")).toBe("true");
    expect(describedBy(names)).toBe("Add the couple’s names. Every album needs a title.");
    expect(document.activeElement).toBe(names);

    const slot = screen.getByRole("group", { name: "Slot 7" });
    expect(describedBy(slot)).toBe("Slot 7 is empty. Add a photograph.");
    expect(describedBy(screen.getByRole("group", { name: "Slot 6" }))).toBe("");
    expect(publishAlbum).not.toHaveBeenCalled();
  });

  it("clears a mark as soon as the thing is fixed", async () => {
    open(albumWith(fullGallery(), { shotOn: "2022-01-02" }));
    await userEvent.click(publishButton());
    await screen.findByText("1 thing needs fixing before this album can go live.");

    await userEvent.type(field("Couple names"), "Benali & Yasiru");
    expect(field("Couple names").getAttribute("aria-invalid")).toBeNull();
    expect(screen.queryByText(/needs fixing/)).toBeNull();
  });
});

describe("publishing", () => {
  it("asks first, then shows the green strip through a live region", async () => {
    const album = complete();
    vi.mocked(publishAlbum).mockResolvedValue({
      ok: true,
      data: { ...album, stage: "published", publishedAt: "2026-10-12T09:00:00.000Z" },
    });
    open(album);
    await userEvent.click(publishButton());
    const modal = await screen.findByRole("dialog", { name: "Publish this album?" });
    await userEvent.click(within(modal).getByRole("button", { name: "Publish album" }));

    const strip = await screen.findByText("Saved. These changes are live on the album page.");
    expect(strip.getAttribute("aria-live")).toBe("polite");
    expect(publishAlbum).toHaveBeenCalledWith("alb_000019", null);
    expect(screen.getAllByText(/Last published just now/).length).toBeGreaterThan(0);
  });

  it("marks exactly the slots the API refuses", async () => {
    vi.mocked(publishAlbum).mockResolvedValue({
      ok: false,
      code: "album_not_publishable",
      message: "This album cannot go out yet.",
      fields: {
        "photos.7": "The photograph in slot 7 has not finished uploading.",
        "photos.3.alt": "Describe the photograph in slot 3.",
      },
    });
    open(complete());
    await userEvent.click(publishButton());
    const modal = await screen.findByRole("dialog", { name: "Publish this album?" });
    await userEvent.click(within(modal).getByRole("button", { name: "Publish album" }));

    await screen.findByText("2 things need fixing before this album can go live.");
    expect(describedBy(screen.getByRole("group", { name: "Slot 7" }))).toBe(
      "The photograph in slot 7 has not finished uploading.",
    );
    expect(describedBy(screen.getByRole("group", { name: "Slot 8" }))).toBe("");
    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() => {
      expect(document.activeElement?.closest('[data-problem="photos.7"]')).not.toBeNull();
    });
  });

  it("puts a taken address beside its field, with the API’s suggestion", async () => {
    vi.mocked(publishAlbum).mockResolvedValue({
      ok: false,
      code: "slug_taken",
      message: "That address is taken. Try benali-yasiru-2.",
      fields: { slug: "That address is taken. Try benali-yasiru-2." },
    });
    open(complete());
    await userEvent.click(publishButton());
    const modal = await screen.findByRole("dialog", { name: "Publish this album?" });
    await userEvent.click(within(modal).getByRole("button", { name: "Publish album" }));

    await waitFor(() => {
      expect(describedBy(field("Page address"))).toContain(
        "That address is taken. Try benali-yasiru-2.",
      );
    });
    expect(field("Page address").getAttribute("aria-invalid")).toBe("true");
  });
});

describe("Draft and Cancel", () => {
  it("saves only what changed and goes back to the dashboard", async () => {
    const album = albumWith([]);
    vi.mocked(saveAlbum).mockResolvedValue({ ok: true, data: album });
    open(album);
    await userEvent.type(field("Wedding location"), "Hilton Residencies");
    await userEvent.click(screen.getAllByRole("button", { name: "Draft" })[0]!);

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith("/studio");
    });
    expect(saveAlbum).toHaveBeenCalledWith("alb_000019", { location: "Hilton Residencies" });
  });

  it('asks before throwing edits away, and leaves at once when there are none', async () => {
    open(albumWith([]), '/studio?stage=draft');
    await userEvent.type(field('Wedding time'), 'Morning');
    await userEvent.click(screen.getAllByRole('button', { name: 'Cancel' })[0]!);

    const modal = await screen.findByRole("alertdialog", { name: "Discard your changes?" });
    expect(router.push).not.toHaveBeenCalled();
    await userEvent.click(within(modal).getByRole('button', { name: 'Discard changes' }));
    expect(router.push).toHaveBeenCalledWith('/studio?stage=draft');
  });
});

describe("on a desktop", () => {
  it("lays the slots out as the album page and previews the title bar from the form", async () => {
    stubWidth(true);
    open(albumWith([]));
    const preview = screen.getByRole("region", {
      name: "Photographs, laid out as on the album page",
    });
    expect(
      within(preview).getByRole("button", { name: "Add photo for slot 18 of 18" }),
    ).toBeTruthy();

    await userEvent.type(field("Couple names"), "Benali & Yasiru");
    expect(within(preview).getByText("Benali & Yasiru")).toBeTruthy();
  });
});
