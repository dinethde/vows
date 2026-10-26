import { expect, test } from "@playwright/test";

/** The form's own name. The month under the date field is a dialog too. */
const FORM = /Let’s talk/;

test("a visitor sends an enquiry and sees the thank-you in place of the form", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Let’s talk" }).click();

  const dialog = page.getByRole("dialog", { name: FORM });
  await expect(dialog.getByRole("textbox", { name: "Your name" })).toBeFocused();

  await dialog.getByRole("textbox", { name: "Your name" }).fill("Playwright Visitor");
  await dialog
    .getByRole("textbox", { name: "Email" })
    .fill(`e2e-${String(Date.now())}@example.com`);
  await dialog.getByRole("textbox", { name: "Mobile" }).fill("+94 71 000 0000");
  // Typed, then corrected from the month that opens under the field.
  const date = dialog.getByRole("textbox", { name: "Wedding date" });
  await date.fill("14 feb 2030");
  await dialog.getByRole("button", { name: "15 February 2030" }).click();
  await expect(date).toHaveValue("15 February 2030");
  await expect(date).toBeFocused();
  await dialog
    .getByRole("textbox", { name: "Additional notes" })
    .fill("Sent by the end-to-end suite.");

  // A person takes longer than three seconds over six fields. So does this.
  await page.waitForTimeout(3200);
  await dialog.getByRole("button", { name: "Send" }).click();

  const thanks = page.getByRole("dialog", { name: "Thank you." });
  await expect(thanks.getByText("Your message is on its way.")).toBeVisible();
  await expect(thanks.getByRole("textbox")).toHaveCount(0);
});

test("the form sits whole inside the window at every width", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Let’s talk" }).click();
  const form = page.getByRole("dialog", { name: FORM });
  await expect(form.getByRole("textbox", { name: "Your name" })).toBeVisible();

  const box = await form.boundingBox();
  if (!box) throw new Error("The form has no box.");
  const width = page.viewportSize()?.width ?? 0;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(width);
  // A card in the middle on a wide window; a sheet edge to edge on a phone.
  expect(Math.abs(box.x + box.width / 2 - width / 2)).toBeLessThanOrEqual(1);
});

test("a half-typed email is marked when the visitor leaves the field, and says what to do", async ({
  page,
}) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Let’s talk" }).click();
  const email = page.getByRole("textbox", { name: "Email" });

  await email.fill("benali.perera@gmail");
  await page.getByRole("textbox", { name: "Mobile" }).focus();

  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(
    page.getByText("That does not look like a full email address. Try name@example.com"),
  ).toBeVisible();
});

test("Escape closes the form and puts focus back on the button that opened it", async ({
  page,
}) => {
  await page.goto("/contact");
  const open = page.getByRole("button", { name: "Let’s talk" });
  await open.click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(open).toBeFocused();
});

test("Escape closes the month first, and a date that is not one says what to type", async ({
  page,
}) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Let’s talk" }).click();
  const form = page.getByRole("dialog", { name: FORM });
  const date = form.getByRole("textbox", { name: "Wedding date" });

  await date.click();
  const month = page.getByRole("dialog", { name: "Choose the wedding date" });
  await expect(month).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(month).toHaveCount(0);
  await expect(form).toBeVisible();
  await expect(date).toBeFocused();

  await date.fill("next spring");
  await form.getByRole("textbox", { name: "Wedding place" }).focus();
  await expect(date).toHaveAttribute("aria-invalid", "true");
  await expect(
    form.getByText("Type the date in full, like 14 February 2027, or pick it below."),
  ).toBeVisible();
});
